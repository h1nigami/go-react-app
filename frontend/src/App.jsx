import "./styles/App.css";
import { useEffect, useState } from "react";
import { createTask, deleteTask, getTask, updateTask } from "./api/apiTask";
import { motion, AnimatePresence } from "framer-motion";
import EditDropdown from "./components/editDropDown";
import AuthForm from "./components/authForm";
import MapComponent from "./components/map";
import WorkScheduleSelect from "./components/scheduleComponent";


function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [schedule, setSchedule] = useState(null)
  const [coordinates, setCoordinates] = useState({ x: "", y: "" });
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("")

  

  useEffect(() => {
    getTask()
      .then(setTasks)
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
    if (!newTask.trim()) return;
    const created = await createTask({
      title: newTask,
      schedule: {
        days: schedule.days.join(","),
        start: schedule.start,
        end: schedule.end,
      },
      x: coordinates.x ? parseFloat(coordinates.x) : null,
      y: coordinates.y ? parseFloat(coordinates.y) : null,
      addres: address,
      email: email,
      phoneNumber: phoneNumber,
    })
    setTasks((prev) => [...prev, created]);;
    
    } 
    catch (error) {
      console.log(error)
    }
    finally{
    setNewTask("");
    setSchedule(null);
    setCoordinates({ x: "", y: "" });
    setAddress("");
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
          <WorkScheduleSelect value={schedule} onChange={setSchedule}/>
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
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Адрес (опционально)"
            style={{ padding: "0.5rem", width: "80%" }}
          />
          <input
            type="email"  
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            placeholder="Email"/>
          <input 
            value={phoneNumber} 
            onChange={(e)=>{
              let value = e.target.value.replace(/\D/g, "")
              let formated = "";
              if (value.length > 0) formated = "+7";
              if (value.length > 1) formated += ` (${value.slice(1,4)})`
              if (value.length > 4) formated += ` ${value.slice(4,7)}`
              if (value.length > 7) formated += `-${value.slice(7,9)}`
              if (value.length > 9) formated += `-${value.slice(9,11)}`
              setPhoneNumber(formated)}} 
            placeholder="+7 (999) 123-45-67"/>
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
                <span>
                  {t.title} | приоритет: {t.priority}{" "}
                  {t.x && t.y ? `| координаты: (${t.x}, ${t.y})` : ""}{" "}
                  {t.addres ? `| адрес: ${t.addres}` : ""}
                  {t.email ? `| почта: ${t.email}` : ""}
                  {t.phoneNumber ? `| телефон: ${t.phoneNumber}` : ""}
                </span>
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
