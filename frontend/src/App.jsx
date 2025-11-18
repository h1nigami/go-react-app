import "./styles/App.css";
import { useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  geoCode,
  getTask,
  updateTask,
} from "./api/apiTask";
import { motion, AnimatePresence } from "framer-motion";
import EditDropdown from "./components/editDropDown";
import AuthForm from "./components/authForm";
import MapComponent from "./components/map";
import WorkScheduleSelect from "./components/scheduleComponent";
import scheduleDays from "./scripts/schedulePrintScript";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [coordinates, setCoordinates] = useState({
    x_from: "",
    y_from: "",
    x_to: "",
    y_to: "",
  });
  const [address, setAddress] = useState({
    from: {
      street: "",
      city: "",
      country: "",
      number: "",
    },
    to: {
      street: "",
      city: "",
      country: "",
    },
  });
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    getTask()
      .then(setTasks)
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const coordsFrom = await geoCode(
        `${address.from.country} ${address.from.city} ${address.from.street} ${address.from.number}`,
      );
      const coordsTo = await geoCode(
        `${address.to.country} ${address.to.city} ${address.to.street} ${address.to.number}`,
      );
      setCoordinates({
        x_to: coordsTo.x,
        y_to: coordsTo.y,
        x_from: coordsFrom.x,
        y_from: coordsFrom.y,
      });
      const created = await createTask({
        title: newTask,
        schedule: {
          days: schedule.days.join(","),
          start: schedule.start,
          end: schedule.end,
        },
        x_from: coordsFrom.x ? parseFloat(coordsFrom.x) : null,
        y_from: coordsFrom.y ? parseFloat(coordsFrom.y) : null,
        x_to: coordsTo.x ? parseFloat(coordsTo.x) : null,
        y_to: coordsTo.y ? parseFloat(coordsTo.y) : null,
        addres: {
          from: {
            street: address.from.street,
            city: address.from.city,
            country: address.from.country,
            number: address.from.number,
          },
          to: {
            street: address.to.street,
            city: address.to.city,
            country: address.to.country,
            number: address.to.number,
          },
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
      setCoordinates({ x_from: "", y_from: "", x_to: "", y_to: "" });
      setAddress({
        from: {
          street: "",
          city: "",
          country: "",
          number: "",
        },
        to: {
          street: "",
          city: "",
          country: "",
          number: "",
        },
      });
      setEmail("");
      setPhoneNumber("");
    }
  };

  const deletetask = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.ID !== id));
  };

  const fetchTasks = async () => {
    const tasksfromserver = await getTask();
    setTasks(tasksfromserver);
  };

  return (
    <div>
      <div>
        <AuthForm />
      </div>

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
            />
            <h1>От</h1>
            <input
              value={address.from.country}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  from: { ...prev.from, country: e.target.value },
                }))
              }
              placeholder="Страна"
              style={{ padding: "0.5rem", width: "80%" }}
            />
            <input
              list="cities"
              value={address.from.city}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  from: { ...prev.from, city: e.target.value },
                }))
              }
              placeholder="Город"
              style={{ padding: "0.5rem", width: "80%" }}
            />

            <input
              value={address.from.street}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  from: { ...prev.from, street: e.target.value },
                }))
              }
              placeholder="Улица"
              style={{ padding: "0.5rem", width: "80%" }}
            />
            <input
              value={address.from.number}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  from: { ...prev.from, number: e.target.value },
                }))
              }
              placeholder="Номер дома"
              style={{ padding: "0.5rem", width: "80%" }}
            />
            <h1>До</h1>
            <input
              value={address.to.country}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  to: { ...prev.to, country: e.target.value },
                }))
              }
              placeholder="Страна"
              style={{ padding: "0.5rem", width: "80%" }}
            />
            <input
              list="cities"
              value={address.to.city}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  to: { ...prev.to, city: e.target.value },
                }))
              }
              placeholder="Город"
              style={{ padding: "0.5rem", width: "80%" }}
            />

            <input
              value={address.to.street}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  to: { ...prev.to, street: e.target.value },
                }))
              }
              placeholder="Улица"
              style={{ padding: "0.5rem", width: "80%" }}
            />
            <input
              value={address.to.number}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  to: { ...prev.to, number: e.target.value },
                }))
              }
              placeholder="Номер дома"
              style={{ padding: "0.5rem", width: "80%" }}
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
                  <div className="contact-info">
                    <h3 className="contact-title">{t.title}</h3>

                    {t.x_to && t.y_to && t.y_from && t.x_from  && (
                      <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <span className="contact-label">Координаты:</span>
                        <span className="contact-value">
                          Начало: ({t.x_from}, {t.y_from}) Конец: ({t.x_to}, {t.y_to})
                        </span>
                      </div>
                    )}

                    {t.addres && (
                      <div className="contact-item">
                        <span className="contact-icon">🏠</span>
                        <span className="contact-label">Адрес:</span>
                        <span className="contact-value">
                          {t.addres.city}/{t.addres.street}/{t.addres.number}
                        </span>
                      </div>
                    )}

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
                      onClick={() => deletetask(t.ID)}
                      className="button"
                      type="submit"
                    >
                      Удалить
                    </button>
                    <EditDropdown
                      task={t}
                      onEdit={fetchTasks}
                      onDelete={(task) => deletetask(task)}
                    />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
        <div className="map-contaiter">
          <MapComponent tasks={tasks} onTaskUpdate={updateTask}></MapComponent>
        </div>
      </div>
    </div>
  );
}

export default App;
