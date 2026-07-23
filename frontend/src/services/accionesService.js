import { getAcciones } from "../api/acciones";

// Obtiene el catalogo completo de acciones activas, para el checklist de permisos del formulario de roles
export const obtenerAcciones = async () => {
  const response = await getAcciones();

  if (!response.ok) {
    throw new Error("No se pudieron obtener las acciones.");
  }

  return response.data;
};
