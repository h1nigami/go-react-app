import { useEffect, useRef, useState } from "react";
import { createUserAndAuth, logout } from "../api/apiUser";
import "../styles/AuthForm.css";

function AuthForm() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [newMail, setMail] = useState("");
  const [newLogin, setLogin] = useState("");
  const [newPassword, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [formMode, setFormMode] = useState("register");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      email: newMail,
      username: newLogin,
      password: newPassword,
    };
    try {
      await createUserAndAuth(payload);
      setOpen(false);
      setUser(payload);
      setMail("");
      setLogin("");
      setPassword("");
      console.log("User created");
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div className="auth-container">
      {!user ? (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="button"
            onClick={() => {
              setFormMode("register");
              setOpen(true);
            }}
          >
            Регистрация
          </button>
          <button
            className="button"
            onClick={() => {
              setFormMode("login");
              setOpen(true);
            }}
          >
            Войти
          </button>
        </div>
      ) : (
        <button className="button" onClick={handleLogout}>
          Выйти
        </button>
      )}

      {open && (
        <div className="auth-form-overlay">
          <div
            className="auth-form"
            ref={menuRef}
          >
            <form className="auth-form-card" onSubmit={handleSubmit}>
              {formMode === "register" && (
                <input
                  type="email"
                  value={newMail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="Почта"
                  required
                />
              )}
              <input
                type="text"
                value={newLogin}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Логин"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
              />
              <button className="button" type="submit">
                {formMode === "register" ? "Зарегистрироваться" : "Войти"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthForm;