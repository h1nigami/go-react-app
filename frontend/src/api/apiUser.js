const API_BASE_URL = "http://localhost:8082";

/**
 * Проверяет текущий статус аутентификации пользователя
 * @returns {Object|null} данные пользователя или null если не аутентифицирован
 */
export async function checkAuthStatus() {
  try {
    console.log("Checking authentication status...");
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("User is authenticated:", data);
      return data;
    } else {
      console.log("User is not authenticated");
      return null;
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    return null;
  }
}

/**
 * Создает пользователя и выполняет аутентификацию
 * @param {Object} user - данные пользователя (email,username, password)
 * @param {string} mode - режим работы: "register" или "login"
 * @returns {Object} результат операции
 */
export async function createUserAndAuth(user, mode) {
  if (mode === "register") {
    try {
      // 1. Регистрация пользователя
      console.log("Starting registration...");
      const registerResponse = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || "Ошибка при регистрации");
      }

      const registerData = await registerResponse.json();
      console.log("Registration successful:", registerData);

      // 2. Авторизация после регистрации
      await performLogin(user.username, user.password);
      console.log("Auto-login successful");

      // 3. Верификация после авторизации
      return await performVerification(registerData);
    } catch (error) {
      console.error("Error in createUserAndAuth:", error);
      throw error;
    }
  } else if (mode === "login") {
    try {
      // 1. Авторизация пользователя
      console.log("Starting login...");
      await performLogin(user.username, user.password);
      console.log("Login successful");

      // 2. Проверяем статус после входа
      return await checkAuthStatus();
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }
}

/**
 * Выполняет вход пользователя в систему
 * @param {string} username - имя пользователя
 * @param {string} password - пароль пользователя
 * @returns {Promise} результат запроса авторизации
 */
async function performLogin(username, password) {
  const loginResponse = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: username,
      password: password,
    }),
    credentials: "include",
  });

  if (!loginResponse.ok) {
    const errorData = await loginResponse.json();
    throw new Error(errorData.error || "Ошибка при авторизации");
  }

  return loginResponse;
}

/**
 * Выполняет верификацию сессии
 * @param {Object} registerData - данные регистрации
 * @returns {Object} результат верификации
 */
async function performVerification(registerData) {
  const verifyResponse = await fetch(`${API_BASE_URL}/verify`, {
    method: "GET",
    credentials: "include",
  });

  if (verifyResponse.ok) {
    const verifyData = await verifyResponse.json();
    console.log("Verification successful:", verifyData);

    return {
      registration: registerData,
      verification: verifyData,
      status: "fully_authenticated",
    };
  } else {
    console.log("Verification failed");

    return {
      registration: registerData,
      status: "registered_but_not_verified",
    };
  }
}

/**
 * Выполняет выход пользователя из системы
 * @returns {boolean} true если выход выполнен успешно, иначе false
 */
export async function logout() {
  try {
    const logoutResponse = await fetch(`${API_BASE_URL}/logout`, {
      method: "GET",
      credentials: "include",
    });

    if (logoutResponse.ok) {
      console.log("Logout successful");
      localStorage.clear();
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
