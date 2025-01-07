import axios from "axios";

// Determine the base URL based on the current environment
const getBaseUrl = () => {
  const isProd = window.location.hostname !== 'localhost';
  return isProd 
    ? 'https://lumina-1.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api; 