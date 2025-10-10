import './App.css';
import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTask } from './api';
import {motion, AnimatePresence} from 'framer-motion';
import EditDropdown from './components/editDropDown';

function App() {
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('');
  
  useEffect(() => {
    getTask()
      .then(setTasks)
      .catch(err => console.error(err));
  }, []); // ✅ теперь запрос один раз

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return; // ✅ исправлено
    const created = await createTask({ title: newTask, priority:priority });
    setTasks(prev => [...prev, created]);
    setNewTask('');
    setPriority('')
  };

 const deletetask = async (id) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(task => task.ID !== id))
  };

  return (
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
              {t.title} приоритет: {t.priority}
              </span>
              <div className='task-buttons'>
                <button onClick={()=>deletetask(t.ID)} className='button' type='submit'>Удалить</button>
                <EditDropdown 
                      task={t}
                      onEdit={(task) => console.log('Редактирование:', task)}
                      onDelete={(task) => deletetask(task)}
                    />
                    </div>
              </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default App;
