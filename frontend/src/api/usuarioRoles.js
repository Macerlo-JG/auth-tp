import { authFetch } from "./cliente";
import { parseResponse } from "../auth/utils/parse";

// Obtiene el listado de todos los roles disponibles
export const getRoles = async () => {
  const res = await authFetch("/usuarios/roles");

  return parseResponse(res);
};

// Obtiene los roles asignados a un usuario
export const getRolesUsuario = async (idUsuario) => {
  const res = await authFetch(`/usuarios/${idUsuario}/roles`);

  return parseResponse(res);
};

// Asigna un rol a un usuario

export const agregarRolUsuario = async (idUsuario, idRol) => {
  const res = await authFetch(`/usuarios/${idUsuario}/roles`, {
    method: "POST",

    // Convierte el identificador del rol a numero y lo envia dentro de una lista
    body: JSON.stringify({
      id_roles: [Number(idRol)],
    }),
  });

  return parseResponse(res);
};

// Revoca un rol especifico de un usuario
export const eliminarRolUsuario = async (idUsuario, idRol) => {
  const res = await authFetch(`/usuarios/${idUsuario}/roles/${idRol}`, {
    method: "DELETE",
  });

  return parseResponse(res);
};
