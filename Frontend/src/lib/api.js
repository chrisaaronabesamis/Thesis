import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_KEY = import.meta.env.VITE_API_KEY || "thread";

console.log("API Config:", { API_URL, API_KEY });

const api = axios.create({
  baseURL: API_URL,
  headers: {
    apikey: API_KEY,
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // or however you store it

  console.log("token", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
