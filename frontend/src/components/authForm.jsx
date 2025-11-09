import { useEffect, useRef, useState } from "react";
import { createUserAndAuth, logout } from "../api/apiUser";
import "../styles/AuthForm.css";

// Константы для улучшения читаемости
const FORM_MODES = {
  REGISTER: "register",
  LOGIN: "login",
};

function AuthForm() {
  // Состояния
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(FORM_MODES.REGISTER);
  const [user, setUser] = useState(null);
  
  // Данные формы
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const menuRef = useRef(null);

  // Обработчик клика вне формы
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOutside = menuRef.current && 
                           !menuRef.current.contains(event.target);
      
      if (isClickOutside) {
        setIsFormOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Обработчики изменений формы
  const handleInputChange = (field) => (event) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: event.target.value
    }));
  };

  // Открытие формы
  const openForm = (mode) => {
    setFormMode(mode);
    setIsFormOpen(true);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      password: "",
    });
  };

  // Отправка формы
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    try {
      await createUserAndAuth(payload, formMode);
      
      setIsFormOpen(false);
      setUser(payload);
      resetForm();
      
      console.log("User created successfully");
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  // Выход из системы
  const handleLogout = async () => {
    const isLoggedOut = await logout();
    
    if (isLoggedOut) {
      setUser(null);
    }
    
    setIsFormOpen(false);
  };

  // Вспомогательные переменные для рендеринга
  const isRegisterMode = formMode === FORM_MODES.REGISTER;
  const submitButtonText = isRegisterMode ? "Зарегистрироваться" : "Войти";

  return (
    <div className="auth-container">
      {/* Кнопки авторизации */}
      {!user ? (
        <div className="auth-buttons-container">
          <button
            className="button"
            onClick={() => openForm(FORM_MODES.REGISTER)}
          >
            Регистрация
          </button>
          <button
            className="button"
            onClick={() => openForm(FORM_MODES.LOGIN)}
          >
            Войти
          </button>
        </div>
      ) : (
        <button className="button" onClick={handleLogout}>
          Выйти
        </button>
      )}

      {/* Модальное окно формы */}
      {isFormOpen && (
        <div className="auth-form-overlay">
          <div className="auth-form" ref={menuRef}>
            <form className="auth-form-card" onSubmit={handleSubmit}>
              {/* Поле email только для регистрации */}
              {isRegisterMode && (
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="Почта"
                  required
                />
              )}

              {/* Общие поля формы */}
              <input
                type="text"
                value={formData.username}
                onChange={handleInputChange("username")}
                placeholder="Логин"
                required
              />
              
              <input
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder="Пароль"
                required
              />

              <button className="button" type="submit">
                {submitButtonText}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthForm;