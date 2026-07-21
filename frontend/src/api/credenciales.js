// Llama al backend para operaciones con contraseñas:
// cambiar la clave actual (con confirmación por OTP) o pedir una
// contraseña temporal.
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
// /credenciales/cambiar y /credenciales/cambiar/solicitar-otp ahora están
// protegidos con @jwt_required() en el backend (antes /cambiar recibía
// id_usuario directo en el body, lo cual permitía -en teoría- pedir un
// cambio de contraseña para cualquier id_usuario con solo armar el JSON).
function headersAutenticados() {
  const token = authService.getSession()?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Paso 1 del flujo de cambio de contraseña: pide el OTP que se manda al
// correo del usuario logueado (el backend resuelve el email a partir del
// JWT, no hace falta mandar nada en el body).
export async function solicitarOtpCambioContrasena() {
  const res = await fetch(`${API}/cambiar/solicitar-otp`, {
    method: "POST",
    headers: headersAutenticados(),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

// Paso 2: aplica el cambio. Ahora requiere el otp del paso 1.
// id_usuario/updated_by ya NO se mandan: el backend los toma del JWT.
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