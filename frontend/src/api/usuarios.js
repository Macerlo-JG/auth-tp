import { authFetch } from "./cliente";
import { parseApiError } from "../auth/utils/parse";

// Obtiene el listado de usuarios.
export const getUsuarios = async () => {
  const res = await authFetch("/usuarios");

  return res.json();
};

// Obtiene la informacion de un usuario segun su identificador.
export const getUsuario = async (id) => {
  const res = await authFetch(`/usuarios/${id}`);

  return res.json();
};

// Crea un nuevo usuario.
export const crearUsuario = async (data) => {
  const res = await authFetch("/usuarios", {
    method: "POST",

    // Envia los datos del usuario en formato JSON.
    body: JSON.stringify(data),
  });

  // Devuelve el resultado de la operacion junto con la respuesta del servidor.
  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
};

// Crea un usuario junto con la info relacionada necesaria para completar el proceso de alta.
export const crearUsuarioCompleto = async (data) => {
  const res = await authFetch("/usuarios/completo", {
    method: "POST",

    // Envia los datos completos del usuario en formato JSON.
    body: JSON.stringify(data),
  });

  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
};

// Actualiza la informacion de un usuario existente.
export const editarUsuario = async (id, data) => {
  const res = await authFetch(`/usuarios/${id}`, {
    method: "PUT",

    // Envia los datos actualizados del usuario.
    body: JSON.stringify(data),
  });

  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
};

// Elimina un usuario segun su identificador.
export const eliminarUsuario = async (id) => {
  const res = await authFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });

  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
};

// Lista de estados posibles para un usuario.
export const ESTADOS_USUARIO = ["PENDIENTE", "ACTIVO", "BLOQUEADO", "INACTIVO"];
