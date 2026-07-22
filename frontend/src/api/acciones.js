import { authFetch } from "./cliente";

const parseResponse = async (res) => {
  const body = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    status: res.status,
    data: body.data ?? [],
    message: body.message ?? "",
  };
};

// Obtiene el catálogo de acciones activas.
// Se usa para armar el checklist de permisos al crear/editar un rol.
export const getAcciones = async () => {
  const res = await authFetch("/acciones");
  return parseResponse(res);
};
