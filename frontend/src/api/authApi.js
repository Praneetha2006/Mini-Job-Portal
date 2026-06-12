const BASE_URL = "http://localhost:5000/api/auth";

// Parse validator details if present in backend error response
const handleApiError = (data, defaultMessage) => {
  if (data && data.errors && Array.isArray(data.errors)) {
    return data.errors.map((err) => `${err.message}`).join(", ");
  }
  return data?.message || defaultMessage;
};

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
    throw new Error(handleApiError(data, "Registration failed. Please try again."));
  }
  return data.data;
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
    throw new Error(handleApiError(data, "Invalid email or password."));
  }
  return data.data;
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
    throw new Error(handleApiError(data, "Session validation failed."));
  }
  return data.data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No session token available.");
  }

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Profile update failed."));
  }
  return data.data;
};
