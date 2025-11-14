import { useEffect, useRef } from 'react';

const MapComponent = ({ tasks = [] }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const currentMarkers = useRef([]);

  const getMarkerIcon = (priority) => {
    const icons = {
      'high': 'islands#redIcon',
      'medium': 'islands#orangeIcon', 
      'low': 'islands#greenIcon'
    };
    return icons[priority] || 'islands#blueIcon';
  };

  const getMarkerColor = (priority) => {
    const colors = {
      'high': '#ff0000',
      'medium': '#ff8c00',
      'low': '#32cd32'
    };
    return colors[priority] || '#1e90ff';
  };

  const refreshMarkers = () => {
    if (!mapInstance.current || !window.ymaps) return;

    currentMarkers.current.forEach(marker => {
      mapInstance.current.geoObjects.remove(marker);
    });
    currentMarkers.current = [];

    const activeTasks = tasks.filter(task => 
      task.x && task.y && !task.Is_Done
    );

    activeTasks.forEach(task => {
      const marker = new window.ymaps.Placemark(
        [task.x, task.y],
        {
          balloonContentHeader: task.title,
          balloonContentBody: `
            <div style="padding: 8px;">
              <p><strong>Приоритет:</strong> ${task.priority || 'Не указан'}</p>
              <p><strong>Адрес:</strong> ${task.addres || 'Не указан'}</p>
              <p><strong>Статус:</strong> ${task.Is_Done ? 'Выполнено' : 'В процессе'}</p>
              ${task.description ? `<p><strong>Описание:</strong> ${task.description}</p>` : ''}
            </div>
          `,
          balloonContentFooter: '',
          hintContent: task.title
        },
        {
          preset: getMarkerIcon(task.priority),
          iconColor: getMarkerColor(task.priority)
        }
      );

      mapInstance.current.geoObjects.add(marker);
      currentMarkers.current.push(marker);
    });

    if (currentMarkers.current.length > 0) {
      mapInstance.current.setBounds(mapInstance.current.geoObjects.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 30
      });
    }
  };

  useEffect(() => {
    const loadMaps = () => {
      if (window.ymaps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.onload = () => {
        window.ymaps.ready(() => initMap());
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || !window.ymaps) return;

      if (!mapInstance.current) {
        mapInstance.current = new window.ymaps.Map(mapContainer.current, {
          center: [55.7522, 37.6156],
          zoom: 10,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapInstance.current && window.ymaps) {
      refreshMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const activeTasksCount = tasks.filter(task => task.x && task.y && !task.Is_Done).length;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        Карта задач ({activeTasksCount})
      </h2>
      
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '2px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
      
      {activeTasksCount === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#666',
          fontStyle: 'italic',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          Нет активных задач с координатами для отображения на карте
        </div>
      )}
    </div>
  );
};

export default MapComponent;