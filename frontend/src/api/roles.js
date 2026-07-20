import { AUTH_API } from "../auth/config";

const API = `${AUTH_API}/usuarios`;
const ROLES_API = `${AUTH_API}/usuarios/roles`;

// Normaliza respuesta del backend a una uniforme para facilidad del front
const parseResponse = async (res) => {
  // Si el body no es JSON parseable, cae a {} en vez de romper.
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    data: body.data ?? [],
    message: body.message ?? "",
  };
};

//export para poder ser usada de otros archivos,
//async para asincronia
//fetch: envia peticion http a la url
export const getRoles = async () => {
  const res = await fetch(ROLES_API);
  return parseResponse(res);
};

export const getRolesUsuario = async (idUsuario) => {
  const res = await fetch(`${API}/${idUsuario}/roles`);
  return parseResponse(res);
};

// el back end acepta una lista, pero lo enviamos de a uno.
export const agregarRolUsuario = async (idUsuario, idRol) => {
  const res = await fetch(`${API}/${idUsuario}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_roles: [Number(idRol)],
      created_by: 1, //  hardcodeado: no hay usuario autenticado real todavía ((cambiar a futuro))
    }),
  });

  return parseResponse(res);
};

// revoca un rol puntual.
export const eliminarRolUsuario = async (idUsuario, idRol) => {
  const res = await fetch(`${API}/${idUsuario}/roles/${idRol}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updated_by: 1 }), // cambiar hardocodeo
  });

  return parseResponse(res);
};
