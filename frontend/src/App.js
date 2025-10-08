import './App.css';
import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTask } from './api';

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

  const deletetask = async (id)=>{
    await deleteTask(id)
    setTasks(prev => prev.filter(task => task.ID !== id))
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
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
        {tasks.map((t) => (
          <li style={{padding:'1rem'}} key={t.ID}>{t.title} приоритет: {t.priority}
          <button onClick={()=>deletetask(t.ID)} className='button'>Удалить</button>
            </li>
        ))};
      </ul>
    </div>
  );
}

export default App;
