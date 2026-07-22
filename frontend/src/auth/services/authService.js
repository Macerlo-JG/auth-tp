import * as authApi from "../api/auth";

// Clave utilizada para almacenar la sesión en el Local Storage
const STORAGE_KEY = "auth";

// Guarda la información de la sesión (token y datos del usuario) en el almacenamiento local del navegador
function guardarSesion(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Obtiene la sesión almacenada en el Session Storage si no existe, devuelve null
function obtenerSesion() {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

// Elimina la sesión almacenada en el Local Storage
function eliminarSesion() {
  sessionStorage.removeItem(STORAGE_KEY);
}

// Inicia sesión enviando las credenciales al backend
// Si la autenticación es exitosa, guarda la sesión localmente y devuelve la respuesta recibida
async function login(email, password) {
  const response = await authApi.login({
    email,
    password,
  });

  guardarSesion(response);

  return response;
}

// Cierra la sesión del usuario. Notifica al backend y elimina la sesión almacenada localmente
async function logout() {
  const sesion = obtenerSesion();
  // Intenta notificar al backend aunque no haya token local.
  // Si falla, igual limpiamos la sesión local.
  try {
    await authApi.logout(sesion?.access_token);
  } finally {
    eliminarSesion();
  }
}
// Pide un access_token nuevo usando el refresh_token guardado, y
// actualiza la sesión local con el token renovado (mantiene el resto
// de los datos de la sesión intactos: roles, acciones, user, etc.)
async function renovarToken() {
  const sesion = obtenerSesion();

  if (!sesion?.refresh_token) {
    throw new Error("No hay una sesión para renovar.");
  }

  const { access_token } = await authApi.refresh(sesion.refresh_token);

  guardarSesion({ ...sesion, access_token });

  return access_token;
}

// Devuelve la información de la sesión actual almacenada en el Local Storage
function getSession() {
  return obtenerSesion();
}

// Verifica si el usuario esta autenticado.
// Devuelve true si existe un access_token almacenado, de lo contrario, devuelve false
function isAuthenticated() {
  return !!obtenerSesion()?.access_token;
}

// Exporta el servicio de autenticacion para ser utilizado en cualquier parte de la aplicacion
export default {
  login,
  logout,
  getSession,
  isAuthenticated,
  renovarToken,
  // Limpieza local sin avisar al backend: se usa cuando el refresh_token
  // también venció y no tiene sentido notificar un logout que ya no es válido.
  clearSession: eliminarSesion,
};
