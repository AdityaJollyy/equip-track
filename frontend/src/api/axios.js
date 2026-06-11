import axios from "axios";

const api = axios.create({
  // Use environment variable, fallback to your local backend port
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",

  // CRITICAL: This allows Axios to send and receive the httpOnly cookies
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
