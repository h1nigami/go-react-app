

const API_URL = 'http://localhost:8081'

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

export async function deleteTask(id) {
    const responce = await fetch(`${API_URL}/task/${id}`, {
        method: 'DELETE'
    });
    if (!responce.ok) throw new Error('failed to delete task');
    return responce.json();
}

export async function updateTask(id, updatedTask){
    const responce = await fetch(`${API_URL}/task/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify(updatedTask)
    });
    if (!responce.ok) throw new Error('failed to update task');
    return responce.json()
}