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

// Construye los encabezados de la peticion
function construirHeaders(options, token) {
  return {
    // Agrega el Content-Type cuando la peticion envia un body
    ...(options.body ? { "Content-Type": "application/json" } : {}),

    // Conserva los encabezados enviados por el componente
    ...options.headers,

    // Agrega el Access Token si existe una sesion activa
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Realiza una peticion autenticada al backend
// Si el Access Token expiro, intenta renovarlo automaticamente y reintenta la peticion
export async function authFetch(path, options = {}) {
  // Obtiene la sesion almacenada del usuario
  const sesion = authService.getSession();

  // Realiza la peticion utilizando el Access Token actual
  let res = await fetch(`${AUTH_API}${path}`, {
    ...options,
    headers: construirHeaders(options, sesion?.access_token),
  });

  // Si el servidor responde con un 401 y existe un
  // Refresh Token, intenta renovar la sesion
  if (res.status === 401 && sesion?.refresh_token) {
    try {
      const nuevoToken = await refrescarToken();

      res = await fetch(`${AUTH_API}${path}`, {
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
