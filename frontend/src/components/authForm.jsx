import { useEffect, useRef, useState } from "react";
import { createUser } from "../api/apiUser";




function AuthForm(){
    const [open, setOpen] = useState(false)
    const menuRef = useRef();
    const [newMail, setMail] = useState()
    const [newLogin, setLogin] = useState()
    const [newPassword, setPassword] = useState()

    useEffect(()=>{
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)){
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return ()=> document.removeEventListener('mousedown', handleClickOutside);
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const user = {"email":newMail, "username":newLogin, "password":newPassword};
            await createUser(user);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="dropdown-container">
            <button className="button" onClick={()=>setOpen(true)}>Регистрация</button>
        {open && (<div className="auth-form" ref={menuRef}>
            <form className="todo-card" onSubmit={handleSubmit}>
                <input value={newMail} onChange={(e)=>setMail(e.target.value)} placeholder="Почта" />
                <input value={newLogin} onChange={(e)=>setLogin(e.target.value)} placeholder="Логин" />
                <input value={newPassword} onChange={(e)=>setPassword(e.target.value)} placeholder="Пароль" />
                <button className="button" type="submit">Зарегистрироваться</button>
            </form>
        </div>)}
        </div>
    );
}

export default AuthForm;