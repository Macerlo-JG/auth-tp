import { API_URL } from "./auth";
import authService from "../services/authService";

const API = `${API_URL}/credenciales`;

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

// Arma el header de autorización a partir de la sesión guardada.
function headersAutenticados() {
  const token = authService.getSession()?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Pido OTP que se manda al correo del usuario
export async function solicitarOtpCambioContrasena() {
  const res = await fetch(`${API}/cambiar/solicitar-otp`, {
    method: "POST",
    headers: headersAutenticados(),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

// Aplico el cambio. Requiero el otp de solicitarOtpCambioContrasena
export async function cambiarContrasena({ password_actual, password_nueva, otp }) {
  const res = await fetch(`${API}/cambiar`, {
    method: "POST",
    headers: headersAutenticados(),
    body: JSON.stringify({
      password_actual,
      password_nueva,
      otp,
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