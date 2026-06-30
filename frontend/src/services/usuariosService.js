import { getUsuarios } from "../api/api";
import { getPersonas } from "../api/personas";

export const getListadoUsuarios = async () => {
  const [usuariosRes, personasRes] = await Promise.all([
    getUsuarios(),
    getPersonas(),
  ]);

  if (!usuariosRes.ok) {
    throw new Error("No se pudieron obtener los usuarios");
  }

  if (!personasRes.ok) {
    throw new Error("No se pudieron obtener las personas");
  }

  const personas = new Map(
    personasRes.data.map((persona) => [persona.id_persona, persona]),
  );

  return (usuariosRes.data || []).map((usuario) => ({
    ...usuario,
    persona: personas.get(usuario.id_persona) ?? {
      nombre: "-",
      apellido: "-",
      email: "-",
    },
  }));
};
