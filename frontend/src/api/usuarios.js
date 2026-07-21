import { authFetch } from "./cliente";

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

export const getUsuarios = async () => {
  const res = await authFetch("/usuarios");
  return res.json();
};

export const getUsuario = async (id) => {
  const res = await authFetch(`/usuarios/${id}`);
  return res.json();
};

export const crearUsuario = async (data) => {
  const res = await authFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const crearUsuarioCompleto = async (data) => {
  const res = await authFetch("/usuarios/completo", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const editarUsuario = async (id, data) => {
  const res = await authFetch(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const eliminarUsuario = async (id) => {
  const res = await authFetch(`/usuarios/${id}`, { method: "DELETE" });
  return { ok: res.ok, status: res.status, body: await res.json() };
};

export const ESTADOS_USUARIO = ["PENDIENTE", "ACTIVO", "BLOQUEADO", "INACTIVO"];
