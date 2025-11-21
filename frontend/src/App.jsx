import "./styles/App.css";
import { useEffect, useState } from "react";
import {
  createsource,
  deletesource,
  getsource,
  updatesource,
} from "./api/apiTask";
import { motion, AnimatePresence } from "framer-motion";
import EditDropdown from "./components/editDropDown";
import MapComponent from "./components/map";
import WorkScheduleSelect from "./components/scheduleComponent";
import scheduleDays from "./scripts/schedulePrintScript";
import OrderComponent from "./components/orderComponent";
import { getOrders } from "./api/apiOrders";

function App() {
  const [openOrderSet, SetopenOrderSet] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [schedule, setSchedule] = useState(null);
  
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    getsource()
      .then(setTasks)
      .catch((err) => console.error(err));
    fetchOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const created = await createsource({
        title: newTask,
        schedule: {
          days: schedule.days.join(","),
          start: schedule.start,
          end: schedule.end,
        },
        email: email,
        phoneNumber: phoneNumber,
      });
      setTasks((prev) => [...prev, created]);
    } catch (error) {
      console.log(error);
    } finally {
      setNewTask("");
      setSchedule(null);
      setEmail("");
      setPhoneNumber("");
    }
  };

  const deleteSource = async (id) => {
    await deletesource(id);
    setTasks((prev) => prev.filter((task) => task.ID !== id));
  };

  const fetchTasks = async () => {
    const tasksfromserver = await getsource();
    setTimeout(setTasks(tasksfromserver), 10)
  };

  const fetchOrders = async () => {
    const ordersFromserver = await getOrders();
    setOrders(ordersFromserver);
  };

  // Функция для зума к координатам
  const zoomToCoordinates = (coords) => {
    if (mapRef && coords) {
      mapRef.setCenter([coords.x, coords.y], 10, {
        duration: 300
      });
    }
  };

  // Обработчик клика на координаты "От"
  const handleZoomFrom = (task) => {
    if (task.x_from && task.y_from) {
      zoomToCoordinates({ x: task.x_from, y: task.y_from });
    }
  };

  // Обработчик клика на координаты "До"
  const handleZoomTo = (task) => {
    if (task.x_to && task.y_to) {
      zoomToCoordinates({ x: task.x_to, y: task.y_to });
    }
  };

  return (
    <div>
      <div className="layot">
        <div className="todo-card">
          <h1>Создать источник</h1>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Наименование"
              style={{ padding: "0.5rem", width: "80%" }}
              required
            />
            <WorkScheduleSelect value={schedule} onChange={setSchedule} />
            {/* 
            <div style={{ display: "flex", gap: "0.5rem", width: "80%" }}>
              <input
                type="number"
                value={coordinates.x}
                onChange={(e) =>
                  setCoordinates((prev) => ({ ...prev, x: e.target.value }))
                }
                placeholder="Широта"
                style={{ padding: "0.5rem", flex: 1 }}
              />
              <input
                type="number"
                value={coordinates.y}
                onChange={(e) =>
                  setCoordinates((prev) => ({ ...prev, y: e.target.value }))
                }
                placeholder="Долгота"
                style={{ padding: "0.5rem", flex: 1 }}
              />
            </div>
*/}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              value={phoneNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                let formated = "";
                if (value.length > 0) formated = "+7";
                if (value.length > 1) formated += ` (${value.slice(1, 4)})`;
                if (value.length > 4) formated += ` ${value.slice(4, 7)}`;
                if (value.length > 7) formated += `-${value.slice(7, 9)}`;
                if (value.length > 9) formated += `-${value.slice(9, 11)}`;
                setPhoneNumber(formated);
              }}
              placeholder="+7 (999) 123-45-67"
              required
            />
            <button type="submit" className="button">
              Добавить
            </button>
          </form>

          <ul>
            <AnimatePresence>
              {tasks.map((t) => (
                <motion.li
                  className={`priority-${t.priority}`}
                  key={t.ID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                  
                >
                  
                  <div className="contact-info" >
                    
                    <h3 className="contact-title">{t.title}</h3>

                    {/*t.x_to && t.y_to && t.y_from && t.x_from  && (
                      <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <span className="contact-label">Координаты:</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span 
                            className="contact-value"
                            style={{ cursor: "pointer", color: "#2196F3", textDecoration: "underline" }}
                            onClick={() => handleZoomFrom(t)}
                            title="Нажмите для приближения к начальной точке"
                          >
                            Начало: ({t.x_from}, {t.y_from})
                          </span>
                          <span 
                            className="contact-value"
                            style={{ cursor: "pointer", color: "#2196F3", textDecoration: "underline" }}
                            onClick={() => handleZoomTo(t)}
                            title="Нажмите для приближения к конечной точке"
                          >
                            Конец: ({t.x_to}, {t.y_to})
                          </span>
                        </div>
                      </div>
                    )*/}


                    {t.email && (
                      <div className="contact-item">
                        <span className="contact-icon">✉️</span>
                        <span className="contact-label">Почта:</span>
                        <a href={`mailto:${t.email}`} className="contact-link">
                          {t.email}
                        </a>
                      </div>
                    )}

                    {t.phonenumber && (
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <span className="contact-label">Телефон:</span>
                        <a
                          href={`tel:${t.phonenumber}`}
                          className="contact-link"
                        >
                          {t.phonenumber}
                        </a>
                      </div>
                    )}

                    {t.schedule && (
                      <div className="contact-item">
                        <span className="contact-icon">🕒</span>
                        <span className="contact-label">График:</span>
                        <span className="contact-value">
                          {scheduleDays(t.schedule.days)} {t.schedule.start}-
                          {t.schedule.end}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="task-buttons">
                    <button
                      onClick={() => deleteSource(t.ID)}
                      className="button"
                      type="submit"
                    >
                      Удалить
                    </button>
                    <EditDropdown
                      task={t}
                      onEdit={fetchTasks}
                      onDelete={(task) => deleteSource(task)}
                    />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

        </div>  

            
            <OrderComponent 
              orders={orders} 
              onOrderCreate={fetchOrders}
              tasks={tasks}
            ></OrderComponent>

        <div className="map-contaiter">
          <MapComponent orders={orders} onTaskUpdate={updatesource} onMapReady={setMapRef} onChange={fetchOrders}></MapComponent>
        </div>
      </div>
    </div>
  );
}

export default App;