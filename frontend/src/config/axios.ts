import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api/v1'
    : '/api/v1',
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