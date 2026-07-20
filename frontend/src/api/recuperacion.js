import { AUTH_API } from "../auth/config";

const API = `${AUTH_API}/recuperacion`;

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

export async function solicitarOtpRecuperacion(email) {
  const res = await fetch(`${API}/solicitar-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

export async function verificarOtpRecuperacion({ email, otp }) {
  const res = await fetch(`${API}/verificar-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

export async function cambiarContrasenaRecuperacion({
  email,
  otp,
  password_nueva,
}) {
  const res = await fetch(`${API}/cambiar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, password_nueva }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}
