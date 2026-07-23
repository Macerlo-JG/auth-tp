import { authFetch } from "./cliente";
import { parseResponse } from "../auth/utils/parseApiError";

// Obtiene el catálogo de acciones activas.
// Se usa para armar el checklist de permisos al crear/editar un rol
export const getAcciones = async () => {
  const res = await authFetch("/acciones");
  return parseResponse(res);
};
