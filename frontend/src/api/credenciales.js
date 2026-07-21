import { authFetch } from "./cliente";

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
  const res = await authFetch("/credenciales/cambiar", {
    method: "POST",
    body: JSON.stringify({
      id_usuario,
      password_actual,
      password_nueva,
      updated_by,
    }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

export async function crearContrasenaTemporal({ id_usuario, created_by }) {
  const res = await authFetch("/credenciales/temporal", {
    method: "POST",
    body: JSON.stringify({ id_usuario, created_by }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}
