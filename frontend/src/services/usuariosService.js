import { getUsuarios } from "../api/usuarios";
import { getPersonas } from "../api/personas";
import { getRolesUsuarioDetalle } from "./usuarioRolesService";

// Se Obtiene el listado de usuarios junto con sus datos personales (nombre, apellido y email)

export const getListadoUsuarios = async () => {
  // Se consultan ambas APIs al mismo tiempo usando promise.all
  const [usuariosRes, personasRes] = await Promise.all([
    getUsuarios(),
    getPersonas(),
  ]);

  // Validacion
  if (!usuariosRes.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  // Validacion
  if (!personasRes.ok) {
    throw new Error("No se pudieron obtener las personas");
  }

  // Se crea un map con la clave id_persona
  // Esto permite buscar una persona en O en lugar de recorrer el arreglo completo para cada usuario
  const personas = new Map(
    personasRes.data.map((persona) => [persona.id_persona, persona]),
  );

  // Ya no hay nombre ni apellido reales: solo email. Si no se
  // encuentra la persona, se muestra "—".
  return (usuariosRes.data || []).map((usuario) => ({
    ...usuario,
    persona: personas.get(usuario.id_persona) ?? { email: "—" },
  }));
};

// Obtiene toda la info de un usuario y sus roles

export const getUsuarioDetalle = async (idUsuario) => {
  // Obtiene el listado de usuarios con sus personas.
  const lista = await getListadoUsuarios();

  // Busca el usuario solicitado.
  const usuario = lista.find(
    (usuario) => usuario.id_usuario === Number(idUsuario),
  );

  // Si no existe, devuelve null.
  if (!usuario) {
    return null;
  }

  // Obtiene los roles del usuario (rolService)
  const roles = await getRolesUsuarioDetalle(idUsuario);

  // Devuelve toda la información unificada.
  return {
    ...usuario,
    roles,
  };
};
