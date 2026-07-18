const API = "http://localhost:5000/activacion";

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

// funcion para pedir OTP.
export async function solicitarOtpActivacion(email) {
  const res = await fetch(`${API}/solicitar-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}

export async function verificarActivacion({ email, otp }) {
  const res = await fetch(`${API}/verificar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return { ok: res.ok, status: res.status, body: await res.json() };
}
