import * as authApi from "../api/auth";

const STORAGE_KEY = "auth";

function guardarSesion(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function obtenerSesion() {
  const data = localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : null;
}

function eliminarSesion() {
  localStorage.removeItem(STORAGE_KEY);
}

//Inicia sesion.

async function login(email, password) {
  const response = await authApi.login({
    email,
    password,
  });

  guardarSesion(response);

  return response;
}

//Cierra sesion.

async function logout() {
  await authApi.logout();

  eliminarSesion();
}

//Devuelve la sesion actual

function getSession() {
  return obtenerSesion();
}

//Indica si existe una sesión.

function isAuthenticated() {
  return !!obtenerSesion()?.access_token;
}

export default {
  login,
  logout,
  getSession,
  isAuthenticated,
};
