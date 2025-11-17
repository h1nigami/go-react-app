import { useEffect, useRef } from "react";

const MapComponent = ({ tasks = [], onTaskUpdate }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const currentMarkers = useRef([]);
  const originalCoords = useRef(new Map());

  // Ключ для localStorage
  const STORAGE_KEY = 'map_tasks_data';

  // Сохранение задач в localStorage
  const saveTasksToStorage = (tasksData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
    } catch (error) {
      console.warn('Не удалось сохранить задачи в localStorage:', error);
    }
  };

  // Загрузка задач из localStorage
  const loadTasksFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Не удалось загрузить задачи из localStorage:', error);
      return [];
    }
  };

  // Получение всех задач (из пропсов или localStorage)
  const getAllTasks = () => {
    return tasks.length > 0 ? tasks : loadTasksFromStorage();
  };

  const getMarkerIcon = (priority) => {
    const icons = {
      high: "islands#redIcon",
      medium: "islands#orangeIcon",
      low: "islands#greenIcon",
    };
    return icons[priority] || "islands#blueIcon";
  };

  const getMarkerColor = (priority) => {
    const colors = {
      high: "#ff0000",
      medium: "#ff8c00",
      low: "#32cd32",
    };
    return colors[priority] || "#1e90ff";
  };

  const handleSave = (task, newCoords) => {
    const updatedTask = { ...task, x: newCoords[0], y: newCoords[1] };
    onTaskUpdate(task.ID, updatedTask);
    originalCoords.current.delete(task.ID);
    
    // Сохраняем обновленные задачи в localStorage
    const allTasks = getAllTasks();
    const updatedTasks = allTasks.map(t => t.ID === task.ID ? updatedTask : t);
    saveTasksToStorage(updatedTasks);
  };

  const handleCancel = (task, marker) => {
    const original = originalCoords.current.get(task.ID);
    if (original) {
      marker.geometry.setCoordinates(original);
      marker.options.set("iconColor", getMarkerColor(task.priority));
      originalCoords.current.delete(task.ID);
    }
  };

  const refreshMarkers = () => {
    if (!mapInstance.current || !window.ymaps) return;

    currentMarkers.current.forEach((marker) => {
      mapInstance.current.geoObjects.remove(marker);
    });
    currentMarkers.current = [];

    // Используем getAllTasks() для получения данных
    const allTasks = getAllTasks();
    const activeTasks = allTasks.filter(
      (task) => task.x && task.y && !task.Is_Done,
    );

    activeTasks.forEach((task) => {
      const marker = new window.ymaps.Placemark(
        [task.x, task.y],
        {
          balloonContentHeader: "",
          balloonContentBody: `
            <div style="padding: 8px;">
              <p><strong>График работы:</strong> ${task.schedule?.start || "Не указан"} - ${task.schedule?.end || "Не указан"}</p>
              <p><strong>Название:</strong> ${task.title || "Без названия"}</p>
              <p><strong>Адрес:</strong> ${task.addres?.street || "Не указан"}</p>
              <p><strong>Статус:</strong> ${task.Is_Done ? "Выполнено" : "В процессе"}</p>
              <p><strong>Номер телефона:</strong> ${task.phone || "Не указан"}</p>
              <p><strong>Email:</strong> ${task.email || "Не указан"}</p>
              ${task.description ? `<p><strong>Описание:</strong> ${task.description}</p>` : ""}
              <div style="margin-top: 10px; display: flex; gap: 8px;">
                <button id="save-btn-${task.ID}" style="
                  padding: 6px 12px; 
                  background-color: #4CAF50; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 12px;
                ">Сохранить</button>
                <button id="cancel-btn-${task.ID}" style="
                  padding: 6px 12px; 
                  background-color: #f44336; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 12px;
                ">Отменить</button>
              </div>
            </div>
          `,
          balloonContentFooter: "",
          hintContent: task.title || "Задача",
        },
        {
          preset: getMarkerIcon(task.priority),
          iconColor: getMarkerColor(task.priority),
          draggable: true,
        },
      );

      marker.events.add("dragstart", function () {
        originalCoords.current.set(task.ID, marker.geometry.getCoordinates());
        marker.options.set("preset", "islands#blueIcon");
        marker.options.set("iconColor", "#1e90ff");
      });

      marker.events.add("dragend", function (e) {
        const newCoords = e.get("target").geometry.getCoordinates();
        marker.options.set("iconColor", getMarkerColor(task.priority));
        marker.balloon.open();

        setTimeout(() => {
          const saveBtn = document.querySelector(`#save-btn-${task.ID}`);
          const cancelBtn = document.querySelector(`#cancel-btn-${task.ID}`);

          if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            const newSaveBtn = document.querySelector(`#save-btn-${task.ID}`);
            newSaveBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave(task, newCoords);
              marker.balloon.close();
            });
          }

          if (cancelBtn) {
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            const newCancelBtn = document.querySelector(
              `#cancel-btn-${task.ID}`,
            );
            newCancelBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancel(task, marker);
              marker.balloon.close();
            });
          }
        }, 100);
      });

      marker.events.add("drag", function (e) {
        const coords = e.get("target").geometry.getCoordinates();
        console.log("Перетаскивание на:", coords);
      });

      mapInstance.current.geoObjects.add(marker);
      currentMarkers.current.push(marker);
    });
  };

  // Инициализация карты и загрузка данных
  useEffect(() => {
    const loadMaps = () => {
      if (window.ymaps) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
      script.onload = () => {
        window.ymaps.ready(() => initMap());
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current) return;

      const ymaps = window.ymaps;
      if (!ymaps || typeof ymaps.Map !== "function") return;

      if (!mapInstance.current) {
        mapInstance.current = new ymaps.Map(mapContainer.current, {
          center: [58.01, 56.25], //Пермь
          zoom: 10,
          controls: ["zoomControl", "typeSelector", "fullscreenControl"],
        });
      }

      refreshMarkers();
    };
    loadMaps();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []); // eslint-disable-line

  // Обновление маркеров при изменении задач и сохранение в localStorage
  useEffect(() => {
    if (mapInstance.current && window.ymaps) {
      // Сохраняем задачи в localStorage при любом изменении
      saveTasksToStorage(tasks);
      refreshMarkers();
    }
  }, [tasks]); // eslint-disable-line

  // Дополнительное обновление при монтировании компонента
  useEffect(() => {
    if (mapInstance.current && window.ymaps) {
      refreshMarkers();
    }// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance.current, window.ymaps]);

  const allTasks = getAllTasks();
  const activeTasksCount = allTasks.filter(
    (task) => task.x && task.y && !task.Is_Done,
  ).length;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          color: "#333",
        }}
      >
        Карта источников ({activeTasksCount})
      </h2>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "500px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />

      {activeTasksCount === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#666",
            fontStyle: "italic",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px",
            marginTop: "1rem",
          }}
        >
          Нет активных задач с координатами для отображения на карте
        </div>
      )}
    </div>
  );
};

export default MapComponent;
