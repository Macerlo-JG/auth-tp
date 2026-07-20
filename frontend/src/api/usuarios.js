import { AUTH_API } from "../auth/config";

const API = `${AUTH_API}/usuarios`;

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

export const getUsuarios = async () => {
  const res = await fetch(API);
  return res.json();
};

export const getUsuario = async (id) => {
  const res = await fetch(`${API}/${id}`);
  return res.json();
};

export const crearUsuario = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const crearUsuarioCompleto = async (data) => {
  const res = await fetch(`${API}/completo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const editarUsuario = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const eliminarUsuario = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const ESTADOS_USUARIO = ["PENDIENTE", "ACTIVO", "BLOQUEADO", "INACTIVO"];
