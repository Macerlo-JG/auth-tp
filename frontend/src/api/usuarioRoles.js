import { authFetch } from "./cliente";
import authService from "../auth/services/authService";

const parseResponse = async (res) => {
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    data: body.data ?? [],
    message: body.message ?? "",
  };
};

export const getRoles = async () => {
  const res = await authFetch("/usuarios/roles");
  return parseResponse(res);
};

export const getRolesUsuario = async (idUsuario) => {
  const res = await authFetch(`/usuarios/${idUsuario}/roles`);
  return parseResponse(res);
};

// el backend acepta una lista, pero lo enviamos de a uno.
export const agregarRolUsuario = async (idUsuario, idRol) => {
  const idUsuarioSesion = authService.getSession()?.user?.id;

  const res = await authFetch(`/usuarios/${idUsuario}/roles`, {
    method: "POST",
    body: JSON.stringify({
      id_roles: [Number(idRol)],
      created_by: idUsuarioSesion,
    }),
  });

  return parseResponse(res);
};

// revoca un rol puntual.
export const eliminarRolUsuario = async (idUsuario, idRol) => {
  const idUsuarioSesion = authService.getSession()?.user?.id;

  const res = await authFetch(`/usuarios/${idUsuario}/roles/${idRol}`, {
    method: "DELETE",
    body: JSON.stringify({ updated_by: idUsuarioSesion }),
  });

  return parseResponse(res);
};
