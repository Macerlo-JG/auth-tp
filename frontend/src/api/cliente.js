import { AUTH_API } from "../auth/config";
import authService from "../auth/services/authService";

// Evita disparar varios refresh en paralelo cuando dos o más peticiones
// vencen al mismo tiempo (por ejemplo, un Promise.all de varios fetch).
let refrescoEnCurso = null;

function refrescarToken() {
  if (!refrescoEnCurso) {
    refrescoEnCurso = authService
      .renovarToken()
      .finally(() => {
        refrescoEnCurso = null;
      });
  }
  return refrescoEnCurso;
}

function construirHeaders(options, token) {
  return {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function authFetch(path, options = {}) {
  const sesion = authService.getSession();

  let res = await fetch(`${AUTH_API}${path}`, {
    ...options,
    headers: construirHeaders(options, sesion?.access_token),
  });

  // El access token vence a los 15 minutos. Si la petición vuelve 401 y
  // tenemos refresh_token, intentamos renovar una sola vez y reintentar.
  if (res.status === 401 && sesion?.refresh_token) {
    try {
      const nuevoToken = await refrescarToken();

      res = await fetch(`${AUTH_API}${path}`, {
        ...options,
        headers: construirHeaders(options, nuevoToken),
      });
    } catch (error) {
      // El refresh_token también venció o es inválido (dura 7 días):
      // no hay forma de recuperar la sesión, hay que loguearse de nuevo.
      authService.clearSession();
      window.location.assign("/login");
      throw error;
    }
  }

  return res;
}
