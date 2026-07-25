import {
  getRoles,
  getRol,
  createRol,
  updateRol,
  deleteRol,
  reactivateRol, // <- esta función todavía no existe en api/roles.js, hay que agregarla
} from "../api/roles";
import { parseApiError } from "../auth/utils/parse";

// Obtiene todos los roles
export const obtenerRoles = async (incluirInactivos = false) => {
  const response = await getRoles(incluirInactivos);
  if (!response.ok) {
    throw new Error(parseApiError(response.message) || "No se pudieron obtener los roles.");
  }
  return response.data;
};

export const obtenerRol = async (idRol) => {
  const response = await getRol(idRol);
  if (!response.ok) {
    throw new Error(parseApiError(response.message) || "No se pudo obtener el rol.");
  }
  return response.data[0];
};

export const crearRol = async (rol) => {
  const response = await createRol(rol);
  if (!response.ok) {
    throw new Error(parseApiError(response.message) || "No se pudo crear el rol.");
  }
  return response.data;
};

export const actualizarRol = async (idRol, rol) => {
  const response = await updateRol(idRol, rol);
  if (!response.ok) {
    throw new Error(parseApiError(response.message) || "No se pudo actualizar el rol.");
  }
  return response.data;
};

export const eliminarRol = async (idRol) => {
  const response = await deleteRol(idRol);
  if (!response.ok) {
    throw new Error(parseApiError(response.message) || "No se pudo eliminar el rol.");
  }
  return response.data;
};

// Vuelve a activar un rol dado de baja.
export const reactivarRol = async (idRol) => {
  const response = await reactivateRol(idRol);
  if (!response.ok) {
    throw new Error(parseApiError(response.message) || "No se pudo reactivar el rol.");
  }
  return response.data;
};