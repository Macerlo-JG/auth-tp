import { AUTH_API } from "../auth/config";
import authService from "../auth/services/authService";

// Guarda la promesa del refresh en curso para evitar que varias peticiones renueven el token al mismo tiempo
let refrescoEnCurso = null;

// Renueva el Access Token utilizando el Refresh Token
// Si ya existe una renovacion en curso, reutiliza la misma promesa
function refrescarToken() {
  if (!refrescoEnCurso) {
    refrescoEnCurso = authService.renovarToken().finally(() => {
      // Permite que futuras peticiones puedan volver a renovar el token cuando sea necesario
      refrescoEnCurso = null;
    });
  }

  return refrescoEnCurso;
}

function construirHeaders(options, token) {
  const esFormData = options.body instanceof FormData;

  return {
    // No forzar JSON si el body es FormData: el navegador necesita fijar
    // su propio Content-Type con el boundary del multipart.
    ...(options.body && !esFormData ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Realiza una peticion autenticada al backend
// Si el Access Token expiro, intenta renovarlo automaticamente y reintenta la peticion
export async function authFetch(path, options = {}) {
  // Obtiene la sesion almacenada del usuario
  const sesion = authService.getSession();

  // Realiza la peticion utilizando el Access Token actual
  let res = await fetch(`${AUTH_API}/auth/api${path}`, {
    ...options,
    headers: construirHeaders(options, sesion?.access_token),
  });

  // Si el servidor responde con un 401 y existe un
  // Refresh Token, intenta renovar la sesion
  if (res.status === 401 && sesion?.refresh_token) {
    try {
      const nuevoToken = await refrescarToken();

      res = await fetch(`${AUTH_API}/auth/api${path}`, {
        ...options,
        headers: construirHeaders(options, nuevoToken),
      });
    } catch (error) {
      // Si no fue posible renovar la sesion, elimina la informacion local y redirige al login
      authService.clearSession();
      window.location.assign("/login");

      throw error;
    }
  }

  // Devuelve la respuesta obtenida del backend.
  return res;
}
