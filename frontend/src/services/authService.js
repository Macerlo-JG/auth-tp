import * as authApi from "../api/auth";

// Clave utilizada para almacenar la sesión en el Local Storage
const STORAGE_KEY = "auth";

// Guarda la información de la sesión (token y datos del usuario) en el almacenamiento local del navegador
function guardarSesion(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Obtiene la sesión almacenada en el Session Storage si no existe, devuelve null
function obtenerSesion() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

// Elimina la sesión almacenada en el Local Storage
function eliminarSesion() {
  localStorage.removeItem(STORAGE_KEY);
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
};
