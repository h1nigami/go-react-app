import './styles/App.css';
import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTask } from './api/apiTask';
import {motion, AnimatePresence} from 'framer-motion';
import EditDropdown from './components/editDropDown';
import AuthForm from './components/authForm';
import MapComponent from './components/map';

function App() {
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('');
  const [coordinates, setCoordinates] = useState({ x: '', y: '' });
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    getTask()
      .then(setTasks)
      .catch(err => console.error(err));
  }, []); 

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const created = await createTask({ 
      title: newTask, 
      priority: priority,
      x: coordinates.x ? parseFloat(coordinates.x) : null,
      y: coordinates.y ? parseFloat(coordinates.y) : null,
      addres: address
    });
    setTasks(prev => [...prev, created]);
    setNewTask('');
    setPriority('');
    setCoordinates({ x: '', y: '' });
    setAddress('');
  };

 const deletetask = async (id) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(task => task.ID !== id))
  };

  const fetchTasks = async () => {
    const tasksfromserver = await getTask()
    setTasks(tasksfromserver);
  }

  return (
    <div>
      <AuthForm />
    <div className='todo-card'>
      <h1>Tasks</h1>
      <form onSubmit={handleSubmit} style={{display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',}}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder='Новая задача'
          style={{ padding: '0.5rem', width: '80%' }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ padding: '0.5rem', width: '80%' }}
        >
          <option value="">Выберите приоритет</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <div style={{ display: 'flex', gap: '0.5rem', width: '80%' }}>
          <input
            type="number"
            value={coordinates.x}
            onChange={(e) => setCoordinates(prev => ({ ...prev, x: e.target.value }))}
            placeholder='X координата'
            style={{ padding: '0.5rem', flex: 1 }}
          />
          <input
            type="number"
            value={coordinates.y}
            onChange={(e) => setCoordinates(prev => ({ ...prev, y: e.target.value }))}
            placeholder='Y координата'
            style={{ padding: '0.5rem', flex: 1 }}
          />
        </div>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder='Адрес (опционально)'
          style={{ padding: '0.5rem', width: '80%' }}
        />
        <button type='submit' className='button'>Добавить</button>
      </form>
      <ul>
        <AnimatePresence>
          {tasks.map((t) => (
            <motion.li className={`priority-${t.priority}`} 
            key={t.ID}
            initial={{opacity:0, y:20}}
            animate={{opacity:1, y:0}}
            exit={{opacity:0, x:100}}
            transition={{duration:0.3}}>
               <span>
                {t.title} | приоритет: {t.priority} {t.x && t.y ? `| координаты: (${t.x}, ${t.y})` : ''} {t.addres ? `| адрес: ${t.addres}` : ''}
              </span>
              <div className='task-buttons'>
                <button onClick={()=>deletetask(t.ID)} className='button' type='submit'>Удалить</button>
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
    <MapComponent tasks={tasks}></MapComponent>
    </div>
  );
}

export default App;
