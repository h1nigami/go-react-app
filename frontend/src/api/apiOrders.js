import { API_URL } from "./apiTask";

export const getOrders = async () => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

export const getOrder = async (id) => {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

export const createOrder = async (order) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
  const data = await response.json();
  return data;
};