import { authFetch } from "./cliente";
import { API_URL } from "../auth/api/auth";
import { parseApiError } from "../auth/utils/parse";
import authService from "../auth/services/authService";

const API = `${API_URL}/credenciales`;
// Arma el header de autorización a partir de la sesión guardada.
function headersAutenticados() {
  const token = authService.getSession()?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Verifica la contraseña actual del usuario logueado. Se llama antes de
// abrir el modal de OTP, para que un password incorrecto se muestre en el propio formulario,
// sin llegar a generar ni enviar ningún código por mail.
export async function verificarCredencial({ password }) {
  const res = await fetch(`${API}/verificar`, {
    method: "POST",
    headers: headersAutenticados(),
    body: JSON.stringify({ password }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

// Pido OTP que se manda al correo del usuario.
export async function solicitarOtpCambioContrasena(password_actual) {
  const res = await fetch(`${API}/cambiar/solicitar-otp`, {
    method: "POST",
    headers: headersAutenticados(),
    body: JSON.stringify({ password_actual }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

// Aplico el cambio. Requiero el otp de solicitarOtpCambioContrasena
export async function cambiarContrasena({
  password_actual,
  password_nueva,
  otp,
}) {
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

export async function crearContrasenaTemporal({ id_usuario, created_by }) {
  const res = await authFetch("/credenciales/temporal", {
    method: "POST",
    body: JSON.stringify({ id_usuario, created_by }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}
