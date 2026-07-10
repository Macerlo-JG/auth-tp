// Simula una pequeña demora como si fuera una petición HTTP, sirve para implementar la pantalla cargando
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// export async function login(credentials) {
//    const response = await axios.post(
//        "/login",
//        credentials
//    );
//
//    return response.data;
//} para cuando agreguemos JWT

//Permisos pueden ser constantes? ADMIN = "administrador" así hasRole(ROLES.ADMIN)

//Usuario mockj
export const USUARIOS_MOCK = [
  {
    id: 1,
    nombre: "Administrador",
    email: "admin@test.com",
    password: "123456",

    roles: [
      {
        id: 1,
        nombre: "Administrador",
      },
    ],

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
    password: "123456",

    roles: [
      {
        id: 2,
        nombre: "Operador",
      },
    ],

    permisos: ["usuarios.ver", "usuarios.crear", "usuarios.editar"],
  },

  {
    id: 3,
    nombre: "Consultor",
    email: "consultor@test.com",
    password: "123456",

    roles: [
      {
        id: 3,
        nombre: "Consultor",
      },
    ],

    permisos: ["usuarios.ver"],
  },
];

// admin@test.com / 123456
// operador@test.com / 123456
// consultor@test.com / 123456

// Simula el endpoint POST /login

export async function login({ email, password }) {
  await delay(700);

  const usuario = USUARIOS_MOCK.find((u) => u.email === email);

  if (!usuario || usuario.password !== password) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  return {
    success: true,

    access_token: "MOCK_ACCESS_TOKEN",

    refresh_token: "MOCK_REFRESH_TOKEN",

    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
    },

    roles: usuario.roles,

    permisos: usuario.permisos,
  };
}

// Simula el endpoint POST /logout

export async function logout() {
  await delay(300);

  return {
    success: true,
  };
}
