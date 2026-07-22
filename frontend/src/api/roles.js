import { authFetch } from "./cliente";

export function parseApiError(message) {
  if (!message) return "Error desconocido";
  if (typeof message === "string") return message;
  if (typeof message === "object") {
    return Object.values(message).flat().join(", ");
  }
  return "Error desconocido";
}

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
  const res = await authFetch("/roles");
  return parseResponse(res);
};

// Obtener un rol
export const getRol = async (idRol) => {
  const res = await authFetch(`/roles/${idRol}`);
  return parseResponse(res);
};

// Crear rol
export const createRol = async (rol) => {
  const res = await authFetch("/roles", {
    method: "POST",
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Actualizar rol
export const updateRol = async (idRol, rol) => {
  const res = await authFetch(`/roles/${idRol}`, {
    method: "PUT",
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Eliminar rol
export const deleteRol = async (idRol) => {
  const res = await authFetch(`/roles/${idRol}`, {
    method: "DELETE",
  });

  return parseResponse(res);
};
