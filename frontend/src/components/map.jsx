import { useEffect, useRef } from "react";

const MapComponent = ({ tasks = [], onTaskUpdate, onMapReady }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const currentMarkers = useRef([]);
  const originalCoords = useRef(new Map());
  const originalCoordsTo = useRef(new Map());

  // Ключ для localStorage
  const STORAGE_KEY = "map_tasks_data";

  // Сохранение задач в localStorage
  const saveTasksToStorage = (tasksData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
    } catch (error) {
      console.warn("Не удалось сохранить задачи в localStorage:", error);
    }
  };

  // Загрузка задач из localStorage
  const loadTasksFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Не удалось загрузить задачи из localStorage:", error);
      return [];
    }
  };

  // Получение всех задач (из пропсов или localStorage)
  const getAllTasks = () => {
    return tasks.length > 0 ? tasks : loadTasksFromStorage();
  };

  const getMarkerIcon = () => {
    const icons = [
      "islands#redIcon",
      "islands#orangeIcon",
      "islands#greenIcon",
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const getMarkerColor = () => {
    const colors = [
      "#ff0000",
      "#ff8c00",
      "#32cd32",
      "#1e90ff",
      "#ff1493",
      "#00bfff",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Хранит цвет маркера для каждого задания
  const taskColorMap = useRef(new Map());

  const handleSave = (task, newCoords) => {
    const updatedTask = { ...task, x_from: newCoords[0], y_from: newCoords[1] };
    onTaskUpdate(task.ID, updatedTask);
    originalCoords.current.delete(task.ID);

    // Сохраняем обновленные задачи в localStorage
    const allTasks = getAllTasks();
    const updatedTasks = allTasks.map((t) =>
      t.ID === task.ID ? updatedTask : t,
    );
    saveTasksToStorage(updatedTasks);
  };

  const handleSaveTo = (task, newCoords) => {
    const updatedTask = { ...task, x_to: newCoords[0], y_to: newCoords[1] };
    onTaskUpdate(task.ID, updatedTask);
    originalCoordsTo.current.delete(task.ID);

    // Сохраняем обновленные задачи в localStorage
    const allTasks = getAllTasks();
    const updatedTasks = allTasks.map((t) =>
      t.ID === task.ID ? updatedTask : t,
    );
    saveTasksToStorage(updatedTasks);
  };

  const handleCancel = (task, marker) => {
    const original = originalCoords.current.get(task.ID);
    if (original) {
      marker.geometry.setCoordinates(original);
      originalCoords.current.delete(task.ID);
    }
  };

  const handleCancelTo = (task, marker) => {
    const original = originalCoordsTo.current.get(task.ID);
    if (original) {
      marker.geometry.setCoordinates(original);
      originalCoordsTo.current.delete(task.ID);
    }
  };

  const refreshMarkers = () => {
    if (!mapInstance.current || !window.ymaps) return;

    currentMarkers.current.forEach((marker) => {
      mapInstance.current.geoObjects.remove(marker);
    });
    currentMarkers.current = [];

    // Получаем все активные задачи
    const allTasks = getAllTasks();
    const activeTasks = allTasks.filter(
      (task) => task.x_from && task.y_from && task.x_to && task.y_to
    );

    activeTasks.forEach((task) => {
      const adrFrom = `${task.addres?.from.street} ${task.addres?.from.number}`;
      const adrTo = `${task.addres?.to.street} ${task.addres?.to.number}`;

      // Определяем цвет маркера; оба маркера одного задания используют один и тот же цвет
      const marker_color = taskColorMap.current.has(task.ID)
        ? taskColorMap.current.get(task.ID)
        : (() => {
            const color = getMarkerColor();
            taskColorMap.current.set(task.ID, color);
            return color;
          })();
      const marker_icon = getMarkerIcon();

      const marker = new window.ymaps.Placemark(
        [task.x_from, task.y_from],
        {
          balloonContentHeader: "Начало",
          balloonContentBody: `
            <div style="padding: 8px;">
              <p><strong>График работы:</strong> ${task.schedule?.start || "Не указан"} - ${task.schedule?.end || "Не указан"}</p>
              <p><strong>Название:</strong> ${task.title || "Без названия"}</p>
              <p><strong>Адрес:</strong> ${adrFrom || "Не указан"}</p>
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
          iconContent:"A"
        },
        {
          preset: marker_icon,
          iconColor: marker_color,
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
        marker.options.set("iconColor", marker_color);
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

      const markerTo = new window.ymaps.Placemark(
        [task.x_to, task.y_to],
        {
          balloonContentHeader: "Конец",
          balloonContentBody: `
            <div style="padding: 8px;">
              <p><strong>График работы:</strong> ${task.schedule?.start || "Не указан"} - ${task.schedule?.end || "Не указ"}</p>
              <p><strong>Название:</strong> ${task.title || "Без названия"}</p>
              <p><strong>Адрес:</strong> ${adrTo || "Не указан"}</p>
              <p><strong>Статус:</strong> ${task.Is_Done ? "Выполнено" : "В процессе"}</p>
              <p><strong>Номер телефона:</strong> ${task.phone || "Не указан"}</p>
              <p><strong>Email:</strong> ${task.email || "Не указан"}</p>
              ${task.description ? `<p><strong>Описание:</strong> ${task.description}</p>` : ""}
              <div style="margin-top: 10px; display: flex; gap: 8px;">
                <button id="saveTo-btn-${task.ID}" style="
                  padding: 6px 12px; 
                  background-color: #4CAF50; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 12px;
                ">Сохранить</button>
                <button id="cancelTo-btn-${task.ID}" style="
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
          iconContent:"B"
        },
        {
          preset: marker_icon,
          iconColor: marker_color,
          draggable: true,
        },
      );
      markerTo.events.add("dragstart", function () {
        originalCoordsTo.current.set(task.ID, markerTo.geometry.getCoordinates());
        markerTo.options.set("preset", "islands#blueIcon");
        markerTo.options.set("iconColor", "#1e90ff");
      });

      markerTo.events.add("dragend", function (e) {
        const newCoords = e.get("target").geometry.getCoordinates();
        markerTo.options.set("iconColor", marker_color);
        markerTo.balloon.open();
        setTimeout(() => {
          const saveBtn = document.querySelector(`#saveTo-btn-${task.ID}`);
          const cancelBtn = document.querySelector(`#cancelTo-btn-${task.ID}`);

          if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            const newSaveBtn = document.querySelector(`#saveTo-btn-${task.ID}`);
            newSaveBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveTo(task, newCoords);
              markerTo.balloon.close();
            });
          }

          if (cancelBtn) {
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            const newCancelBtn = document.querySelector(
              `#cancelTo-btn-${task.ID}`,
            );
            newCancelBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelTo(task, markerTo);
              markerTo.balloon.close();
            });
          }
        }, 100);
      });

      markerTo.events.add("drag", function (e) {
        const coords = e.get("target").geometry.getCoordinates();
        console.log("Перетаскивание на:", coords);
      });
      
      mapInstance.current.geoObjects.add(marker);
      mapInstance.current.geoObjects.add(markerTo);
      currentMarkers.current.push(marker);
      currentMarkers.current.push(markerTo);
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

        // Передаем ссылку на карту в родительский компонент
        if (onMapReady) {
          onMapReady(mapInstance.current);
        }
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
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance.current, window.ymaps]);

  const allTasks = getAllTasks();
  const activeTasksCount = allTasks.filter(
    (task) => task.x_from && task.y_from 
  ).length;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#2c3e50",
          fontSize: "1.75rem",
          fontWeight: "600",
          padding: "12px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          display: "inline-block",
          minWidth: "280px",
          marginLeft: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
        }}
      >
        Карта источников ({activeTasksCount})
      </h2>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "500px",
          border: "3px solid #e8f4fd",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = "0 12px 40px rgba(31, 38, 135, 0.5)";
          e.target.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = "0 8px 32px rgba(31, 38, 135, 0.37)";
          e.target.style.transform = "translateY(0)";
        }}
      />

      {activeTasksCount === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 2rem",
            color: "#5a6c7d",
            fontSize: "1.1rem",
            fontStyle: "italic",
            background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
            borderRadius: "16px",
            marginTop: "1.5rem",
            boxShadow: "0 6px 20px rgba(252, 182, 159, 0.3)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              fontSize: "2rem",
              opacity: "0.3",
            }}
          >
            📍
          </div>
          Нет активных задач с координатами для отображения на карте
        </div>
      )}
    </div>
  );
};

export default MapComponent;