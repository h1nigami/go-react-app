import { useEffect, useRef, useState } from "react";
import { createUserAndAuth, logout, checkAuthStatus } from "../api/apiUser";
import "../styles/AuthForm.css";

const FORM_MODES = {
  REGISTER: "register",
  LOGIN: "login",
};

function AuthForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(FORM_MODES.REGISTER);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const menuRef = useRef(null);

  // Проверяем статус аутентификации при монтировании компонента
  useEffect(() => {
    const verifyAuthStatus = async () => {
      try {
        const authStatus = await checkAuthStatus();
        setUser(authStatus);
      } catch (error) {
        console.error("Failed to verify auth status:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthStatus();
  }, []);

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

  const handleInputChange = (field) => (event) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: event.target.value
    }));
  };

  const openForm = (mode) => {
    setFormMode(mode);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      password: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    try {
      const authResult = await createUserAndAuth(payload, formMode);
      setUser(authResult);
      setIsFormOpen(false);
      resetForm();
      console.log("User authenticated successfully");
      
       window.location.reload(); 
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleLogout = async () => {
    const isLoggedOut = await logout();
    if (isLoggedOut) {
      setUser(null);
    }
    setIsFormOpen(false);
    
    window.location.reload();
  };

  const isRegisterMode = formMode === FORM_MODES.REGISTER;
  const submitButtonText = isRegisterMode ? "Зарегистрироваться" : "Войти";

  // Показываем загрузку во время проверки статуса аутентификации
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading">Проверка статуса...</div>
      </div>
    );
  }

  return (
    <div className="auth-container">
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

      {isFormOpen && (
        <div className="auth-form-overlay">
          <div className="auth-form" ref={menuRef}>
            <form className="auth-form-card" onSubmit={handleSubmit}>
              {isRegisterMode && (
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="Почта"
                  required
                />
              )}

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