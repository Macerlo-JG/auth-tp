import { AUTH_API } from "../auth/config";
const API = `${AUTH_API}/activacion`;
import { parseApiError } from "../auth/utils/parse";

// Solicita el envio de un codigo OTP al correo del usuario para iniciar el proceso de activacion de la cuenta
export async function solicitarOtpActivacion(email) {
  const res = await fetch(`${API}/solicitar-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // Envia el correo del usuario en formato JSON
    body: JSON.stringify({ email }),
  });

  // Devuelve el resultado de la operacion junto con la respuesta del servidor
  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
}

// Verifica el codigo OTP ingresado por el usuario
// Si el codigo es valido, el backend activa la cuenta
export async function verificarActivacion({ email, otp }) {
  const res = await fetch(`${API}/verificar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // Envia el correo y el codigo OTP en formato JSON
    body: JSON.stringify({ email, otp }),
  });

  // Devuelve el resultado de la operacion junto con la respuesta del servidor
  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
}
