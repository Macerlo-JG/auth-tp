// Convierte los mensajes de error...
export function parseApiError(message) {
  if (!message) return "Error desconocido";

  if (typeof message === "string") return message;

  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }

  return "Error desconocido";
}

// Procesa una respuesta de la API.
export async function parseResponse(res) {
  const body = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    status: res.status,
    data: body.data ?? [],
    message: body.message ?? "",
  };
}
