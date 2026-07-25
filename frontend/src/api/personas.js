import { authFetch } from "./cliente";
import { parseResponse } from "../auth/utils/parse";

// Trae las personas reales desde el backend (mock/emails_usuario.py,
// expuesto por GET /personas). Solo tiene id_persona y email -- no hay
// nombre ni apellido en ningún lado del sistema todavía.
export const getPersonas = async () => {
  const res = await authFetch("/personas");
  return parseResponse(res);
};