import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

export const registerOwner = (data) => api.post("/auth/register", data);
export const loginOwner = (data) => api.post("/auth/login", data);

export function saveSession({ token, user }) {
  localStorage.setItem("sfs_token", token);
  localStorage.setItem("sfs_user", JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("sfs_user"));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("sfs_token"));
}

export function clearSession() {
  localStorage.removeItem("sfs_token");
  localStorage.removeItem("sfs_user");
}
