const API_URL = 'http://localhost:8000'

export async function getTask() {
    const response = await fetch(`${API_URL}/task`);
    if (!response.ok) throw new Error('failed to fetch task');
    return response.json();
}

export async function getTaskById(id) {
    const response = await fetch(`${API_URL}/task/${id}`);
    if (!response.ok) throw new Error('failed to fetch task');
    return response.json();
}

export async function createTask(task) {
    const response = await fetch(`${API_URL}/task`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('failed to create task');
    return response.json();
}