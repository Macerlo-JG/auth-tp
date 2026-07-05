const API = "http://localhost:5000/usuarios";
const ROLES_API = "http://localhost:5000/usuarios/roles";

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
  const res = await fetch(ROLES_API);
  return parseResponse(res);
};

export const getRolesUsuario = async (idUsuario) => {
  const res = await fetch(`${API}/${idUsuario}/roles`);
  return parseResponse(res);
};

export const agregarRolUsuario = async (idUsuario, idRol) => {
  const res = await fetch(`${API}/${idUsuario}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_roles: [Number(idRol)],
      created_by: 1,
    }),
  });

  return parseResponse(res);
};

export const eliminarRolUsuario = async (idUsuario, idRol) => {
  const res = await fetch(`${API}/${idUsuario}/roles/${idRol}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updated_by: 1 }),
  });

  return parseResponse(res);
};
