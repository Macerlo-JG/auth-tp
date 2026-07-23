import {
  getDocumentosPendientes,
  getDocumentosLegales,
  crearDocumentoLegal,
  aceptarDocumentoLegal,
  parseApiError,
} from "../api/documentosLegales";
import { archivoADataUrl } from "../utils/archivoUtils";

// Documentos vigentes pendientes de aceptación para el usuario logueado.
export const obtenerDocumentosPendientes = async () => {
  const response = await getDocumentosPendientes();

  if (!response.ok) {
    throw new Error(
      parseApiError(response.message) || "No se pudieron obtener los documentos pendientes."
    );
  }

  return response.data;
};

// Registra la aceptación de un documento puntual.
export const aceptarDocumento = async (idDocumento) => {
  const response = await aceptarDocumentoLegal(idDocumento);

  if (!response.ok) {
    throw new Error(
      parseApiError(response.message) || "No se pudo registrar la aceptación."
    );
  }

  return response.data;
};

// Todos los documentos (todas las versiones), para el panel de admin.
export const obtenerTodosLosDocumentos = async () => {
  const response = await getDocumentosLegales();

  if (!response.ok) {
    throw new Error(
      parseApiError(response.message) || "No se pudieron obtener los documentos."
    );
  }

  return response.data;
};

// Agrupa el listado plano de documentos por tipo, separando la versión
// vigente del resto (historial), para el panel de administración.
export const agruparDocumentosPorTipo = (documentos) => {
  const grupos = new Map();

  for (const doc of documentos) {
    if (!grupos.has(doc.tipo)) {
      grupos.set(doc.tipo, { tipo: doc.tipo, vigente: null, historial: [] });
    }

    const grupo = grupos.get(doc.tipo);

    if (doc.vigente) {
      grupo.vigente = doc;
    } else {
      grupo.historial.push(doc);
    }
  }

  // Historial más reciente primero.
  for (const grupo of grupos.values()) {
    grupo.historial.sort(
      (a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
    );
  }

  return Array.from(grupos.values());
};

// Publica una nueva versión (o un tipo nuevo) a partir del archivo PDF
// seleccionado en el formulario. Convierte el PDF a data URL para que
// viaje como "contenido" en el body, igual que lo describe la
// documentación del modelo.
export const publicarDocumento = async ({ tipo, version, titulo, fechaPublicacion, archivo }) => {
  const contenido = await archivoADataUrl(archivo);

  const response = await crearDocumentoLegal({
    tipo,
    version,
    titulo,
    fecha_publicacion: fechaPublicacion || undefined,
    contenido,
  });

  if (!response.ok) {
    throw new Error(
      parseApiError(response.message) || "No se pudo publicar el documento."
    );
  }

  return response.data;
};
