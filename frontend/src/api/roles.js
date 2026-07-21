import { AUTH_API } from "../auth/config";

const API = `${AUTH_API}/roles`;

const parseResponse = async (res) => {
  const body = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    status: res.status,
    data: body.data ?? [],
    message: body.message ?? "",
  };
};

// Obtener todos los roles
export const getRoles = async () => {
  const res = await fetch(API);
  return parseResponse(res);
};

// Obtener un rol
export const getRol = async (idRol) => {
  const res = await fetch(`${API}/${idRol}`);
  return parseResponse(res);
};

// Crear rol
export const createRol = async (rol) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Actualizar rol
export const updateRol = async (idRol, rol) => {
  const res = await fetch(`${API}/${idRol}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Eliminar rol
export const deleteRol = async (idRol) => {
  const res = await fetch(`${API}/${idRol}`, {
    method: "DELETE",
  });

  return parseResponse(res);
};
