// Mapa de usuarios para login (MOCK).
// La base de datos no guarda email; acá se relaciona cada correo con su id_usuario.
//
// Al crear un usuario nuevo, agregá una entrada con:
//   - id: el id_usuario que devolvió el backend al crearlo
//   - email: el mismo correo que usaste en el formulario "Nuevo Usuario"
//   - nombre, roles y permisos según corresponda
//
// También agregá el mismo email en backend/mock/emails_usuario.py → EMAIL_POR_ID_USUARIO

const API_URL = "http://localhost:5000";
const API_AUTH_URL = `${API_URL}/auth`;
// admin@test.com / 123456
// alumno@test.com / shiraoki123
// docente@test.com / (sin credencial en seed)

export async function login({ email, password }) {
  const response = await fetch(`${API_AUTH_URL}/login`, {
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
    user: data.user,
    roles: data.roles,
    permisos: data.permisos,
    aviso_cambio_contrasena: data.aviso_cambio_contrasena,
  };
}

export async function logout() {
  await fetch(`${API_AUTH_URL}/logout`, { method: "POST" });
  return { success: true };
}
