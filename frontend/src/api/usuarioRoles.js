import { authFetch } from "./cliente";

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
// created_by NO se manda: el schema (AsignarRolesSchema) sólo acepta
// "id_roles", el backend deriva el usuario de la sesión (g.id_usuario).
export const agregarRolUsuario = async (idUsuario, idRol) => {
  const res = await authFetch(`/usuarios/${idUsuario}/roles`, {
    method: "POST",
    body: JSON.stringify({
      id_roles: [Number(idRol)],
    }),
  });

  return parseResponse(res);
};

// revoca un rol puntual. Esta ruta no espera body: revocar_rol() toma
// id_usuario/id_rol de la URL y el usuario de la sesión.
export const eliminarRolUsuario = async (idUsuario, idRol) => {
  const res = await authFetch(`/usuarios/${idUsuario}/roles/${idRol}`, {
    method: "DELETE",
  });

  return parseResponse(res);
};
