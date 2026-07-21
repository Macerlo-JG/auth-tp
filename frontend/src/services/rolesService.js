import {
  getRoles,
  getRol,
  createRol,
  updateRol,
  deleteRol,
} from "../api/roles";

// Obtiene todos los roles
export const obtenerRoles = async () => {
  const response = await getRoles();

  if (!response.ok) {
    throw new Error("No se pudieron obtener los roles.");
  }

  return response.data;
};

// Obtiene un rol por ID
export const obtenerRol = async (idRol) => {
  const response = await getRol(idRol);

  if (!response.ok) {
    throw new Error("No se pudo obtener el rol.");
  }

  return response.data;
};

// Crea un nuevo rol
export const crearRol = async (rol) => {
  const response = await createRol(rol);

  if (!response.ok) {
    throw new Error("No se pudo crear el rol.");
  }

  return response.data;
};

// Actualiza un rol
export const actualizarRol = async (idRol, rol) => {
  const response = await updateRol(idRol, rol);

  if (!response.ok) {
    throw new Error("No se pudo actualizar el rol.");
  }

  return response.data;
};

// Elimina un rol
export const eliminarRol = async (idRol) => {
  const response = await deleteRol(idRol);

  if (!response.ok) {
    throw new Error("No se pudo eliminar el rol.");
  }

  return response.data;
};
