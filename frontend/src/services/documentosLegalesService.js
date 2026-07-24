import { authFetch } from "../api/cliente";

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") return Object.values(message).flat().join(", ");
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
// Renombrado de getDocumentosPendientes -> obtenerDocumentosPendientes
// para coincidir con VerificarDocumentosLegales.jsx.
export const obtenerDocumentosPendientes = async () => {
  const res = await authFetch("/documentos-legales/pendientes");
  const { ok, data, message } = await parseResponse(res);
  if (!ok) throw new Error(parseApiError(message));
  return data;
};

// Todas las versiones de todos los tipos (panel de admin).
export const obtenerTodosLosDocumentos = async () => {
  const res = await authFetch("/documentos-legales");
  const { ok, data, message } = await parseResponse(res);
  if (!ok) throw new Error(parseApiError(message));
  return data;
};

export function agruparDocumentosPorTipo(documentos) {
  const porTipo = {};

  for (const doc of documentos) {
    if (!porTipo[doc.tipo]) {
      porTipo[doc.tipo] = { tipo: doc.tipo, vigente: null, historial: [] };
    }
    if (doc.vigente) {
      porTipo[doc.tipo].vigente = doc;
    } else {
      porTipo[doc.tipo].historial.push(doc);
    }
  }

  return Object.values(porTipo);
}

export const publicarDocumento = async ({ tipo, version, titulo, fechaPublicacion, archivo }) => {
  const formData = new FormData();
  formData.append("tipo", tipo);
  formData.append("version", version);
  formData.append("titulo", titulo);
  if (fechaPublicacion) formData.append("fechaPublicacion", fechaPublicacion);
  formData.append("archivo", archivo);

  const res = await authFetch("/documentos-legales", { method: "POST", body: formData });
  const { ok, data, message } = await parseResponse(res);
  if (!ok) throw new Error(parseApiError(message));
  return data;
};

// Renombrado de aceptarDocumentoLegal -> aceptarDocumento para coincidir
// con VerificarDocumentosLegales.jsx.
export const aceptarDocumento = async (idDocumento) => {
  const res = await authFetch(`/documentos-legales/${idDocumento}/aceptar`, { method: "POST" });
  const { ok, data, message } = await parseResponse(res);
  if (!ok) throw new Error(parseApiError(message));
  return data;
};