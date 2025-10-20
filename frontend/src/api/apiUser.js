const API_BASE_URL = "http://localhost:8082"

export async function createUser(user) {
    const responce = await fetch(`${API_BASE_URL}/auth`,
        {
            method: 'POST',
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(user),
        }
    );
    if (!responce.ok) {
        throw new Error("Ошибка при запросе к регистрации");
    };
    return responce.json()
}