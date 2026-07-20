// Mapa de usuarios para login (MOCK).
// La base de datos no guarda email; acá se relaciona cada correo con su id_usuario.
//
// Al crear un usuario nuevo, agregá una entrada con:
//   - id: el id_usuario que devolvió el backend al crearlo
//   - email: el mismo correo que usaste en el formulario "Nuevo Usuario"
//   - nombre, roles y permisos según corresponda
//
// También agregá el mismo email en backend/mock/emails_usuario.py → EMAIL_POR_ID_USUARIO
import { AUTH_API } from "../config";

export const API_URL = AUTH_API;

// admin@test.com / 123456
// alumno@test.com / shiraoki123
// docente@test.com / (sin credencial en seed)}

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();

  if (body.code === "CUENTA_PENDIENTE") {
    const error = new Error(body.message);
    error.code = "CUENTA_PENDIENTE";
    error.email = body.data?.email || email;
    error.id_usuario = body.data?.id_usuario;
    throw error;
  }

  if (!response.ok || !body.ok) {
    throw new Error(body.message || "Correo o contraseña incorrectos.");
  }

  const data = body.data;

  return {
    success: true,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    roles: data.roles,
    acciones: data.acciones,
  };
}

export async function logout(accessToken) {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return { success: true };
}
