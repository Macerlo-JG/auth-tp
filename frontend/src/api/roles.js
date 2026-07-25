import { authFetch } from "./cliente";
import { parseResponse } from "../auth/utils/parse";

// Obtiene el listado de roles. Si incluirInactivos es true, también
// trae los roles dados de baja (para el admin, que los puede reactivar).
export const getRoles = async (incluirInactivos = false) => {
  const query = incluirInactivos ? "?incluir_inactivos=true" : "";
  const res = await authFetch(`/roles${query}`);

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
    body: JSON.stringify(rol),
  });

  return parseResponse(res);
};

// Actualiza la informacion de un rol existente
export const updateRol = async (idRol, rol) => {
  const res = await authFetch(`/roles/${idRol}`, {
    method: "PUT",
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

// Vuelve a activar un rol que estaba dado de baja
export const reactivateRol = async (idRol) => {
  const res = await authFetch(`/roles/${idRol}/reactivar`, {
    method: "PUT",
  });

  return parseResponse(res);
};