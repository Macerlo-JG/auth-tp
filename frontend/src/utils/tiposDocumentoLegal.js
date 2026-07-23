// Catálogo de tipos de documento legal.
//
// El campo "tipo" coincide con el ENUM definido en la tabla
// DocumentosLegales ('tyc', 'reglamento', 'politica_privacidad', u otros).
//
// "rolesRequeridos: null" significa "aplica a todos los usuarios".
// Esta relación (a qué rol le corresponde cada tipo) todavía no tiene
// una columna en la base de datos real: por ahora se guarda en
// localStorage, junto con los tipos "personalizados" que se creen desde
// el panel de administración. Cuando el backend exista, lo ideal es que
// esto se guarde del lado del servidor (por ejemplo, con una tabla
// intermedia DocumentoLegalRol).
const KEY_TIPOS_PERSONALIZADOS = "mock_tipos_documento_personalizados";

const TIPOS_BASE = {
  tyc: { label: "Términos y Condiciones", rolesRequeridos: null },
  reglamento: { label: "Reglamento de Alumno", rolesRequeridos: ["ALUMNO"] },
};

function leerTiposPersonalizados() {
  try {
    const data = localStorage.getItem(KEY_TIPOS_PERSONALIZADOS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Devuelve el catálogo completo: los tipos base + los que se hayan
// creado dinámicamente desde el panel de administración.
export function obtenerCatalogoTipos() {
  return { ...TIPOS_BASE, ...leerTiposPersonalizados() };
}

// Registra un tipo de documento nuevo (por ejemplo "politica_privacidad"
// o cualquier otro que el usuario cree desde "Nuevo tipo de documento").
export function agregarTipoPersonalizado(tipo, { label, rolesRequeridos }) {
  const actuales = leerTiposPersonalizados();
  actuales[tipo] = {
    label,
    rolesRequeridos: rolesRequeridos?.length ? rolesRequeridos : null,
  };
  localStorage.setItem(KEY_TIPOS_PERSONALIZADOS, JSON.stringify(actuales));
}

// Devuelve true si, dada una lista de roles del usuario logueado,
// el documento de este "tipo" le corresponde.
export function documentoAplicaARoles(tipo, rolesUsuario) {
  const config = obtenerCatalogoTipos()[tipo];

  if (!config || !config.rolesRequeridos) {
    return true;
  }

  return config.rolesRequeridos.some((rol) => rolesUsuario.includes(rol));
}

export function obtenerLabelTipo(tipo) {
  return obtenerCatalogoTipos()[tipo]?.label ?? tipo;
}
