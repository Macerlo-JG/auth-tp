import {
  getRoles,
  getRolesUsuario,
  agregarRolUsuario,
  eliminarRolUsuario,
} from "../api/roles";

//------ Obtiene los roles existentes y las asignaciones delusuario seleccionado
// Funcion privada que evita duplicar las mismas consultas y validaciones.

const obtenerRolesYAsignaciones = async (idUsuario) => {
  // Se consultan ambas APIs en paralelo para mejorar el rendimiento.
  const [rolesRes, usuarioRolesRes] = await Promise.all([
    getRoles(),
    getRolesUsuario(idUsuario),
  ]);

  // Validación de la respuesta de roles.
  if (!rolesRes.ok) {
    throw new Error("No se pudieron obtener los roles");
  }

  // Validación de la respuesta de los roles asignados al usuario.
  if (!usuarioRolesRes.ok) {
    throw new Error("No se pudieron obtener los roles del usuario");
  }

  // Devuelve ambos conjuntos de datos ya validados.
  return {
    roles: rolesRes.data,
    asignaciones: usuarioRolesRes.data,
  };
};

//------- Obtiene el detalle completo de los roles asignados a un usuario.

export const getRolesUsuarioDetalle = async (idUsuario) => {
  // Obtiene los datos necesarios.
  const { roles, asignaciones } = await obtenerRolesYAsignaciones(idUsuario);

  // Se crea un map para buscar un rol por su id.
  const rolesMap = new Map(roles.map((rol) => [rol.id_rol, rol]));

  // Reemplaza cada relación usuario-rol por el objeto completo del rol.
  // filter(Boolean) elimina posibles valores undefined.
  return asignaciones
    .map((relacion) => rolesMap.get(relacion.id_rol))
    .filter(Boolean);
};

//----- Obtiene únicamente los roles que todavía no fueron asignados al usuario.

export const getRolesDisponibles = async (idUsuario) => {
  // Obtiene los roles existentes y los ya asignados.
  const { roles, asignaciones } = await obtenerRolesYAsignaciones(idUsuario);

  // Se crea un Set con los IDs de los roles asignados para realizar búsquedas eficientes.
  const rolesAsignados = new Set(
    asignaciones.map((relacion) => relacion.id_rol),
  );

  // Devuelve solo los roles que el usuario atodavia no posee.
  return roles.filter((rol) => !rolesAsignados.has(rol.id_rol));
};

// -------Sincroniza los roles de un usuario.
// Compara los roles originales con los actuales y realiza unicamente las operaciones necesarias:
// - Agrega los nuevos.
// - Elimina los quitados.

export const guardarRolesUsuario = async (
  idUsuario,
  rolesOriginales,
  rolesActuales,
) => {
  // Se convierten ambos arreglos en Set para facilitar
  // la comparación por id.
  const originales = new Set(rolesOriginales.map((rol) => rol.id_rol));

  const actuales = new Set(rolesActuales.map((rol) => rol.id_rol));

  // Agregar roles nuevos

  for (const rol of rolesActuales) {
    if (!originales.has(rol.id_rol)) {
      await agregarRolUsuario(idUsuario, rol.id_rol);
    }
  }

  // Eliminar roles quitados

  for (const rol of rolesOriginales) {
    if (!actuales.has(rol.id_rol)) {
      await eliminarRolUsuario(idUsuario, rol.id_rol);
    }
  }
};
