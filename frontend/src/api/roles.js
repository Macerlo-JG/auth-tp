import { authFetch } from "./cliente";
import { parseResponse } from "../auth/utils/parseApiError";

// Obtiene el listado de todos los roles
export const getRoles = async () => {
  const res = await authFetch("/roles");

  return parseResponse(res);
};

// Obtiene la informacion de un rol segun su identificador
export const getRol = async (idRol) => {
  const res = await authFetch(`/roles/${idRol}`);

  return parseResponse(res);
};

// Crea un nuevo rol
export const createRol = async (rol) => {
  const res = await authFetch("/roles", {
    method: "POST",

    // Envia la informacion del rol en formato JSON
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Actualiza la informacion de un rol existente
export const updateRol = async (idRol, rol) => {
  const res = await authFetch(`/roles/${idRol}`, {
    method: "PUT",

    // Envia los datos actualizados del rol
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Elimina un rol segun su identificador
export const deleteRol = async (idRol) => {
  const res = await authFetch(`/roles/${idRol}`, {
    method: "DELETE",
  });

  return parseResponse(res);
};
