import axios, { AxiosHeaders } from "axios";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5050/admin";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

/** Normalize API list response: handles { doctors: [...] } or { data: { doctors: [...] } } */
export function normalizeDoctorsResponse(data: unknown): { email: string; name: string; clinic_id: string; specialization?: string; is_active?: boolean }[] {
  if (data == null || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const arr = d.doctors ?? (d.data as Record<string, unknown>)?.doctors;
  return Array.isArray(arr) ? arr : [];
}

export default api;
