// Capa de API para Documentos Legales.
//
// TODO (cuando exista el backend real): reemplazar este import por
// `import { authFetch } from "./cliente";` — el resto del archivo no
// debería necesitar cambios, ya que mockAuthFetch tiene la misma firma
// y forma de respuesta que authFetch.
import { mockAuthFetch as authFetch } from "./mockDocumentosLegales";

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

const parseResponse = async (res) => {
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    data: body.data ?? [],
    message: body.message ?? "",
  };
};

// Documentos vigentes que el usuario logueado todavía no aceptó.
export const getDocumentosPendientes = async () => {
  const res = await authFetch("/documentos-legales/pendientes");
  return parseResponse(res);
};

// Todos los documentos (todas las versiones, para el panel de admin).
export const getDocumentosLegales = async () => {
  const res = await authFetch("/documentos-legales");
  return parseResponse(res);
};

// Publica una nueva versión de un tipo de documento (o un tipo nuevo).
export const crearDocumentoLegal = async (documento) => {
  const res = await authFetch("/documentos-legales", {
    method: "POST",
    body: JSON.stringify(documento),
  });
  return parseResponse(res);
};

// Registra la aceptación del usuario logueado sobre un documento puntual.
export const aceptarDocumentoLegal = async (idDocumento) => {
  const res = await authFetch(`/documentos-legales/${idDocumento}/aceptar`, {
    method: "POST",
  });
  return parseResponse(res);
};
