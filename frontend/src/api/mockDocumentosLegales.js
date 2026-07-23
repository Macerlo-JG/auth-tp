import authService from "../auth/services/authService";
import { documentoAplicaARoles } from "../utils/tiposDocumentoLegal";

/**
 * Backend simulado para Documentos Legales.
 *
 * No hay endpoints reales todavía, así que este archivo hace las veces
 * de servidor: guarda todo en localStorage y expone una función
 * `mockAuthFetch(path, options)` con la MISMA forma que `authFetch` de
 * ../api/cliente.js (misma firma, misma forma de respuesta: { ok, status,
 * json() }). Cuando el backend real exista, migrar es cambiar, en
 * api/documentosLegales.js, el import de `mockAuthFetch` (este archivo)
 * por `authFetch` (../api/cliente.js) — el resto del código no cambia.
 *
 * Tablas simuladas (mismos campos que la documentación del modelo,
 * pero en snake_case para ser consistentes con el resto del backend real
 * de este proyecto, que usa snake_case en todos sus otros schemas):
 *   - documentos_legales:            DocumentosLegales
 *   - documentos_legales_aceptaciones: UsuarioDocumentoLegal
 */

const KEY_DOCUMENTOS = "mock_documentos_legales";
const KEY_ACEPTACIONES = "mock_documentos_legales_aceptaciones";

// PDF mínimo válido de 1 página, usado como contenido de ejemplo para
// que la demo funcione "out of the box" antes de subir un PDF real.
const PDF_EJEMPLO =
  "data:application/pdf;base64,JVBERi0xLjEKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L01lZGlhQm94WzAgMCAzMDAgMTUwXS9Db250ZW50cyA1IDAgUj4+ZW5kb2JqCjQgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PmVuZG9iago1IDAgb2JqPDwvTGVuZ3RoIDkwPj4Kc3RyZWFtCkJUIC9GMSAxNCBUZiAyMCAxMDAgVGQgKERvY3VtZW50byBkZSBlamVtcGxvIC0gcmVlbXBsYXphciBwb3IgUERGIHJlYWwpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKdHJhaWxlcjw8L1Jvb3QgMSAwIFI+Pgo=";

function ahoraIso() {
  return new Date().toISOString();
}

function leerTabla(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function guardarTabla(key, registros) {
  localStorage.setItem(key, JSON.stringify(registros));
}

function siguienteId(registros, campoId) {
  return registros.reduce((max, r) => Math.max(max, r[campoId] ?? 0), 0) + 1;
}

// Carga datos de ejemplo la primera vez que se usa (localStorage vacío),
// para que el popup de aceptación y el panel de administración tengan
// algo para mostrar sin necesidad de crear todo a mano.
function sembrarSiHaceFalta() {
  const documentos = leerTabla(KEY_DOCUMENTOS);
  if (documentos.length > 0) return;

  const ahora = ahoraIso();

  guardarTabla(KEY_DOCUMENTOS, [
    {
      id_documento: 1,
      tipo: "tyc",
      version: "1.0",
      titulo: "Términos y Condiciones",
      contenido: PDF_EJEMPLO,
      fecha_publicacion: ahora,
      vigente: true,
      created_at: ahora,
      created_by: 1,
      updated_at: null,
      updated_by: null,
      activo: true,
    },
    {
      id_documento: 2,
      tipo: "reglamento",
      version: "1.0",
      titulo: "Reglamento de Alumno",
      contenido: PDF_EJEMPLO,
      fecha_publicacion: ahora,
      vigente: true,
      created_at: ahora,
      created_by: 1,
      updated_at: null,
      updated_by: null,
      activo: true,
    },
  ]);
}

function respuesta(status, ok, data, message = "") {
  return {
    ok,
    status,
    json: async () => ({ ok, data, message }),
  };
}

function simularLatencia() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

// --- Handlers de cada endpoint simulado -----------------------------------

function handleGetPendientes() {
  sembrarSiHaceFalta();

  const sesion = authService.getSession();
  const idUsuario = sesion?.user?.id;
  const roles = sesion?.roles ?? [];

  if (!idUsuario) {
    return respuesta(401, false, [], "No se encontró un token de autenticación");
  }

  const documentos = leerTabla(KEY_DOCUMENTOS).filter(
    (doc) => doc.activo && doc.vigente
  );

  const aceptaciones = leerTabla(KEY_ACEPTACIONES).filter(
    (a) => a.activo && a.id_usuario === idUsuario
  );

  const idsDocumentosAceptados = new Set(
    aceptaciones.map((a) => a.id_documento)
  );

  const pendientes = documentos.filter(
    (doc) =>
      documentoAplicaARoles(doc.tipo, roles) &&
      !idsDocumentosAceptados.has(doc.id_documento)
  );

  return respuesta(200, true, pendientes);
}

function handleGetTodos() {
  sembrarSiHaceFalta();

  const documentos = leerTabla(KEY_DOCUMENTOS)
    .filter((doc) => doc.activo)
    .sort((a, b) => b.id_documento - a.id_documento);

  return respuesta(200, true, documentos);
}

function handleCrearDocumento(body) {
  sembrarSiHaceFalta();

  const sesion = authService.getSession();
  const idUsuarioSesion = sesion?.user?.id;

  const { tipo, version, titulo, fecha_publicacion, contenido } = body ?? {};

  const errores = {};
  if (!tipo) errores.tipo = ["El tipo de documento es obligatorio"];
  if (!version || !String(version).trim())
    errores.version = ["La versión es obligatoria"];
  if (!titulo || !String(titulo).trim())
    errores.titulo = ["El título es obligatorio"];
  if (!contenido) errores.contenido = ["Debe adjuntar el PDF del documento"];

  if (Object.keys(errores).length > 0) {
    return respuesta(400, false, [], errores);
  }

  const documentos = leerTabla(KEY_DOCUMENTOS);
  const ahora = ahoraIso();

  // Si ya había una versión vigente de este tipo, pasa a no vigente
  // (nunca se sobreescribe ni se borra: queda como historial).
  const actualizados = documentos.map((doc) =>
    doc.tipo === tipo && doc.vigente
      ? { ...doc, vigente: false, updated_at: ahora, updated_by: idUsuarioSesion }
      : doc
  );

  const nuevoDocumento = {
    id_documento: siguienteId(documentos, "id_documento"),
    tipo,
    version: String(version).trim(),
    titulo: String(titulo).trim(),
    contenido,
    fecha_publicacion: fecha_publicacion || ahora,
    vigente: true,
    created_at: ahora,
    created_by: idUsuarioSesion,
    updated_at: null,
    updated_by: null,
    activo: true,
  };

  guardarTabla(KEY_DOCUMENTOS, [...actualizados, nuevoDocumento]);

  return respuesta(201, true, nuevoDocumento, "Documento publicado correctamente");
}

function handleAceptarDocumento(idDocumento) {
  sembrarSiHaceFalta();

  const sesion = authService.getSession();
  const idUsuario = sesion?.user?.id;

  if (!idUsuario) {
    return respuesta(401, false, [], "No se encontró un token de autenticación");
  }

  const documentos = leerTabla(KEY_DOCUMENTOS);
  const documento = documentos.find((d) => d.id_documento === idDocumento);

  if (!documento) {
    return respuesta(404, false, [], "El documento no existe");
  }

  const aceptaciones = leerTabla(KEY_ACEPTACIONES);
  const ahora = ahoraIso();

  const nuevaAceptacion = {
    id_usuario_documento_legal: siguienteId(
      aceptaciones,
      "id_usuario_documento_legal"
    ),
    id_usuario: idUsuario,
    id_documento: idDocumento,
    fecha_aceptacion: ahora,
    created_at: ahora,
    created_by: idUsuario,
    updated_at: null,
    updated_by: null,
    activo: true,
  };

  guardarTabla(KEY_ACEPTACIONES, [...aceptaciones, nuevaAceptacion]);

  return respuesta(201, true, nuevaAceptacion, "Documento aceptado");
}

// --- Router simulado --------------------------------------------------------

export async function mockAuthFetch(path, options = {}) {
  await simularLatencia();

  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  if (path === "/documentos-legales/pendientes" && method === "GET") {
    return handleGetPendientes();
  }

  if (path === "/documentos-legales" && method === "GET") {
    return handleGetTodos();
  }

  if (path === "/documentos-legales" && method === "POST") {
    return handleCrearDocumento(body);
  }

  const matchAceptar = path.match(/^\/documentos-legales\/(\d+)\/aceptar$/);
  if (matchAceptar && method === "POST") {
    return handleAceptarDocumento(Number(matchAceptar[1]));
  }

  return respuesta(404, false, [], `Endpoint simulado no encontrado: ${method} ${path}`);
}
