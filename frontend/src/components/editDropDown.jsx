import { useEffect, useRef, useState } from "react";
import './EditDropdown.css';

function EditMenu({task, open, setOpen}){
  const menuRef = useRef();

  // Закрытие меню при клике вне него
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  return (
    open && (
      <div className="dropdown-container" ref={menuRef}>
        <div className="dropdown-menu" >
          <input value={task.title} readOnly />
          <button>Изменить</button>
        </div>
      </div>
    )
  );
}

export default function EditDropdown({ onEdit, onDelete, task }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false)
  const menuRef = useRef();

  // Закрытие меню при клике вне него
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setEditOpen(false)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={menuRef}>
      <button className="button" onClick={() => setOpen(!open)}>
        Редактировать
      </button>
      {open && (
        <div className="dropdown-menu">
          <button onClick={() => setEditOpen(!editOpen)}>Изменить задачу</button>       
          <EditMenu task={task} open={editOpen} setOpen={setEditOpen}/>
          <button onClick={()=> onEdit(task)}>Изменить приоритет</button>
          <button onClick={() => onDelete(task.ID)}>Удалить</button>
        </div>
      )}
    </div>
  );
}