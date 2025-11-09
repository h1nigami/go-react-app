const API_BASE_URL = "http://localhost:8082"
export async function createUserAndAuth(user) {
    try {
        // 1. Регистрация
        console.log("Starting registration...");
        const registerResponse = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user),
            credentials: "include"
        });
        
        if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            throw new Error(errorData.error || "Ошибка при регистрации");
        }

        const registerData = await registerResponse.json();
        console.log("Registration successful:", registerData);

        // 2. Авторизация после регистрации
        console.log("Starting auto-login...");
        const loginResponse = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                identifier: user.username, // используем username для логина
                password: user.password
            }),
            credentials: "include"
        });

        if (!loginResponse.ok) {
            const errorData = await loginResponse.json();
            console.log("Auto-login failed:", errorData);
            throw new Error(errorData.error || "Ошибка при авторизации после регистрации");
        }

        console.log("Auto-login successful");

        // 3. Верификация после авторизации
        console.log("Starting verification...");
        const verifyResponse = await fetch(`${API_BASE_URL}/verify`, {
            method: 'GET',
            credentials: "include"
        });
        
        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log("Verification successful:", verifyData);
            return {
                registration: registerData,
                verification: verifyData,
                status: "fully_authenticated"
            };
        } else {
            console.log("Verification failed");
            return {
                registration: registerData,
                status: "registered_but_not_verified"
            };
        }

    } catch (error) {
        console.error("Error in createUserAndAuth:", error);
        throw error;
    }
}

export async function logout() {
    try {
        const logoutResponse = await fetch(`${API_BASE_URL}/logout`, {
            method: 'GET',
            credentials: "include"
        }); 
        if (logoutResponse.ok) {
            console.log("Logout successful");
            return true;
        } else {
            console.log("Logout failed");
            return false;
        }
    } catch (error) {
        console.error("Error in logout:", error);
        throw error;
    }
}