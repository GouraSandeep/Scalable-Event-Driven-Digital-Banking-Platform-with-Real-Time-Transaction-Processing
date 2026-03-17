import axios from "axios";

const api = axios.create({
  baseURL: "https://scalable-event-driven-digital-banking.onrender.com/api",
  withCredentials: true,
});

export default api;
