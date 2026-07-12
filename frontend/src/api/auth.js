// export async function login(credentials) {
//    const response = await axios.post(
//        "/login",
//        credentials
//    );
//
//    return response.data;
//} para cuando agreguemos JWT

//Permisos pueden ser constantes? ADMIN = "administrador" así hasRole(ROLES.ADMIN)

const API_URL = "http://localhost:5000";

export const USUARIOS_MOCK = [
  {
    id: 1,
    nombre: "Administrador",
    email: "admin@test.com",
    roles: [{ id: 1, nombre: "Administrador" }],
    permisos: [
      "usuarios.ver",
      "usuarios.crear",
      "usuarios.editar",
      "usuarios.eliminar",
      "roles.asignar",
    ],
  },
  {
    id: 2,
    nombre: "Operador",
    email: "operador@test.com",
    roles: [{ id: 2, nombre: "Operador" }],
    permisos: ["usuarios.ver", "usuarios.crear", "usuarios.editar"],
  },
  {
    id: 3,
    nombre: "Consultor",
    email: "consultor@test.com",
    roles: [{ id: 3, nombre: "Consultor" }],
    permisos: ["usuarios.ver"],
  },
];

// admin@test.com / 123456
// operador@test.com / shiraoki123
// consultor@test.com / no hay.

// Simula el endpoint POST /login

export async function login({ email, password }) {
  const usuario = USUARIOS_MOCK.find((u) => u.email === email);
  if (!usuario) throw new Error("Correo o contraseña incorrectos.");

  const response = await fetch(`${API_URL}/credenciales/verificar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_usuario: usuario.id, password }),
  });

  const data = await response.json();
  if (!data.ok) throw new Error("Correo o contraseña incorrectos.");

  return {
    success: true,
    access_token: "MOCK_ACCESS_TOKEN",
    refresh_token: "MOCK_REFRESH_TOKEN",
    user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    roles: usuario.roles,
    permisos: usuario.permisos,
  };
}

// Simula el endpoint POST /logout

export async function logout() {
  return {
    success: true,
  };
}
