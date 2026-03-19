const BASE_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // ✅ Automatically add the token if it exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized (expired token) automatically
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/"; // Force redirect to login
    return;
  }

  return response.json();
};

export default apiRequest;