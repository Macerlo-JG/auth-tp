import { AUTH_API } from "../config";

export const API_URL = AUTH_API;

// Credenciales de prueba:
//
// admin@test.com   / 123456
// alumno@test.com / shiraoki123
// docente@test.com / (sin credencial en el seed)

// Envía las credenciales al backend para iniciar sesion
// Si la autenticación es exitosa, devuelve la información de la sesión del usuario
export async function login({ email, password }) {
  // Realiza la petición al endpoint de login.
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    // Envía el correo y la contraseña en formato JSON
    body: JSON.stringify({ email, password }),
  });

  // Convierte la respuesta del servidor a un objeto JavaScript
  const body = await response.json();

  // Verifica si la cuenta existe pero todavia no fue activada
  // En ese caso, lanza un error con informacion adicional para que el frontend pueda manejar este escenario
  if (body.code === "CUENTA_PENDIENTE") {
    const error = new Error(body.message);
    error.code = "CUENTA_PENDIENTE";
    error.email = body.data?.email || email;
    error.id_usuario = body.data?.id_usuario;

    throw error;
  }

  // Verifica si ocurrio un error durante la autenticación
  if (!response.ok || !body.ok) {
    throw new Error(body.message || "Correo o contraseña incorrectos.");
  }

  // Obtiene la informacion de la sesion devuelta por el backend
  const data = body.data;

  // Devuelve la estructura que utilizara el AuthContext
  // para almacenar la sesión del usuario
  return {
    success: true,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    roles: data.roles,
    acciones: data.acciones,
    user: data.user,
    aviso_cambio_contrasena: data.aviso_cambio_contrasena,
  };
}

// Solicita un nuevo Access Token utilizando el Refresh Token
// Se utiliza cuando el Access Token expiro
export async function refresh(refreshToken) {
  // Realiza la peticion al endpoint de renovación de sesion
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",

    // Envia el Refresh Token en el encabezado Authorization
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  // Convierte la respuesta del servidor a un objeto JavaScript
  const body = await response.json();

  // Verifica si hubo un error al renovar la sesión
  if (!response.ok || !body.ok) {
    throw new Error(body.message || "No se pudo renovar la sesión.");
  }

  // Devuelve el nuevo Access Token generado por el backend
  return body.data;
}

// Cierra la sesion del usuario
// Informa al backend para invalidar la sesion o el Refresh Token
export async function logout(accessToken) {
  // Realiza la petición al endpoint de cierre de sesion
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Devuelve una respuesta exitosa para el frontend
  return {
    success: true,
  };
}
