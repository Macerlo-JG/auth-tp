import {
  getRoles,
  getRolesUsuario,
  agregarRolUsuario,
  eliminarRolUsuario,
} from "../api/roles";

export const getRolesUsuarioDetalle = async (idUsuario) => {
  const rolesRes = await getRoles();
  const usuarioRolesRes = await getRolesUsuario(idUsuario);

  const roles = new Map(rolesRes.data.map((rol) => [rol.id_rol, rol]));

  return usuarioRolesRes.data.map((relacion) => roles.get(relacion.id_rol));
};

export const getRolesDisponibles = async (idUsuario) => {
  const [rolesRes, usuarioRolesRes] = await Promise.all([
    getRoles(),
    getRolesUsuario(idUsuario),
  ]);

  if (!rolesRes.ok) {
    throw new Error("No se pudieron obtener los roles");
  }

  if (!usuarioRolesRes.ok) {
    throw new Error("No se pudieron obtener los roles del usuario");
  }

  // IDs de los roles que ya tiene el usuario
  const rolesAsignados = new Set(
    usuarioRolesRes.data.map((relacion) => relacion.id_rol),
  );

  // Devuelve sólo los roles que aún no tiene
  return rolesRes.data.filter((rol) => !rolesAsignados.has(rol.id_rol));
};

export const guardarRolesUsuario = async (
  idUsuario,
  rolesOriginales,
  rolesActuales,
) => {
  const originales = new Set(rolesOriginales.map((r) => r.id_rol));
  const actuales = new Set(rolesActuales.map((r) => r.id_rol));
  // agregar
  for (const rol of rolesActuales) {
    if (!originales.has(rol.id_rol)) {
      await agregarRolUsuario(idUsuario, rol.id_rol);
    }
  }
  // eliminar
  for (const rol of rolesOriginales) {
    if (!actuales.has(rol.id_rol)) {
      await eliminarRolUsuario(idUsuario, rol.id_rol);
    }
  }
};
