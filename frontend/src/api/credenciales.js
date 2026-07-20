// Llama al backend para operaciones con contraseñas:
// cambiar la clave actual o pedir una contraseña temporal.
import { AUTH_API } from "../auth/config";

const API = `${AUTH_API}/credenciales`;

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

export async function cambiarContrasena({
  id_usuario,
  password_actual,
  password_nueva,
  updated_by,
}) {
  const res = await fetch(`${API}/cambiar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_usuario,
      password_actual,
      password_nueva,
      updated_by,
    }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

export async function crearContrasenaTemporal({ id_usuario, created_by = 1 }) {
  const res = await fetch(`${API}/temporal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_usuario, created_by }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}
