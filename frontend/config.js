export const API_BASE_URL = window.__API_BASE_URL__ || "http://localhost:5000/api";
if (typeof window !== "undefined") {
  window.__API_BASE_URL__ = API_BASE_URL;
}
