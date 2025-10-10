import { useEffect, useRef, useState } from "react";
import './EditDropdown.css';


export default function EditDropdown({ onEdit, onDelete, task }) {
  const [open, setOpen] = useState(false);
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
  }, []);

  return (
    <div className="dropdown-container" ref={menuRef}>
      <button className="dropdown-button" onClick={() => setOpen(!open)}>
        Редактировать
      </button>
      {open && (
        <div className="dropdown-menu">
          <button onClick={() => onEdit(task)}>Изменить задачу</button>
          <button onClick={() => onDelete(task.ID)}>Удалить</button>
        </div>
      )}
    </div>
  );
}