export const ROLES = [
  {
    id_rol: 1,
    nombre: "Administrador",
  },
  {
    id_rol: 2,
    nombre: "GestionAcademica",
  },
  {
    id_rol: 3,
    nombre: "Docente",
  },
  {
    id_rol: 4,
    nombre: "Estudiante",
  },
  {
    id_rol: 5,
    nombre: "AuditorConsulta",
  },
];

export let USUARIO_ROLES = [
  {
    id_usuario: 1,
    id_rol: 1,
  },
  {
    id_usuario: 1,
    id_rol: 5,
  },
  {
    id_usuario: 2,
    id_rol: 4,
  },
  {
    id_usuario: 3,
    id_rol: 3,
  },
];

export const getRoles = async () => ({
  ok: true,
  data: ROLES,
});

export const getRolesUsuario = async (idUsuario) => ({
  ok: true,
  data: USUARIO_ROLES.filter((r) => r.id_usuario === Number(idUsuario)),
});

export const agregarRolUsuario = async (idUsuario, idRol) => {
  const existe = USUARIO_ROLES.some(
    (r) => r.id_usuario === Number(idUsuario) && r.id_rol === Number(idRol),
  );

  if (existe) {
    return {
      ok: false,
      message: "El usuario ya posee ese rol.",
    };
  }

  USUARIO_ROLES.push({
    id_usuario: Number(idUsuario),
    id_rol: Number(idRol),
  });

  return {
    ok: true,
  };
};

export const eliminarRolUsuario = async (idUsuario, idRol) => {
  console.log("ELIMINANDO", idUsuario, idRol);

  USUARIO_ROLES = USUARIO_ROLES.filter(
    (r) => !(r.id_usuario === Number(idUsuario) && r.id_rol === Number(idRol)),
  );

  return {
    ok: true,
  };
};
