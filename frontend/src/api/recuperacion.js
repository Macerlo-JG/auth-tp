import { AUTH_API } from "../auth/config";
const API = `${AUTH_API}/recuperacion`;
import { parseApiError } from "../auth/utils/parse";

// Solicita el envio de un codigo OTP al correo del usuario para iniciar el proceso de recuperacion de contrasena
export async function solicitarOtpRecuperacion(email) {
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
// Si el codigo es valido, permite continuar con el cambio de contrasena
export async function verificarOtpRecuperacion({ email, otp }) {
  const res = await fetch(`${API}/verificar-otp`, {
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

// Cambia la contraseña del usuario luego de que el codigo OTP fue verificado correctamente
export async function cambiarContrasenaRecuperacion({
  email,
  otp,
  password_nueva,
}) {
  const res = await fetch(`${API}/cambiar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // Envia el correo, el codigo OTP y la nueva contrasena en formato JSON
    body: JSON.stringify({
      email,
      otp,
      password_nueva,
    }),
  });

  // Devuelve el resultado de la operacion junto con la respuesta del servidor
  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
}
