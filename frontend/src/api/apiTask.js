const API_URL = "http://localhost:8081";

export async function getsource() {
  const response = await fetch(`${API_URL}/source`, {
    credentials: "include",
    method: "GET",
  });
  if (!response.ok) throw new Error("failed to fetch source");
  return response.json();
}

export async function getsourceById(id) {
  const response = await fetch(`${API_URL}/source/${id}`);
  if (!response.ok) throw new Error("failed to fetch source");
  return response.json();
}

export async function createsource(source) {
  const response = await fetch(`${API_URL}/source`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(source),
    credentials: "include",
  });
  if (!response.ok) throw new Error("failed to create source");
  return response.json();
}

export async function deletesource(id) {
  const responce = await fetch(`${API_URL}/source/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!responce.ok) throw new Error("failed to delete source");
  return responce.json();
}

export async function updatesource(id, updatedsource) {
  const responce = await fetch(`${API_URL}/source/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedsource),
    credentials: "include",
  });
  if (!responce.ok) throw new Error("failed to update source");
  return responce.json();
}

export async function cities() {
  const responce = await fetch(`${API_URL}/cities`);
  if (!responce.ok) throw new Error("failed to fetch cities");
  return responce.json();
}

export async function geoCode(addres) {
  const responce = await fetch(`${API_URL}/geocode/${addres}`);
  if (!responce.ok) throw new Error("failed to fetch geoCode");
  return responce.json();
}
