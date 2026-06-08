const BASE_URL = "http://localhost:5000/api/auth";

export const register = async (userData) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed. Please try again.");
  }
  return data;
};

export const login = async (credentials) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid email or password.");
  }
  return data;
};

export const getMe = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No session token available.");
  }

  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Session validation failed.");
  }
  return data;
};
