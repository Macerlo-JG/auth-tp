// Muestra un rol con un color representativo
// Si el rol no tiene un color definido, se utiliza un estilo gris por defecto

export default function RolBadge({ nombre }) {

  // Colores asociados a cada tipo de rol (los importantes)
  const colores = {
    Administrador: "bg-red-100 text-red-700",
    GestionAcademica: "bg-blue-100 text-blue-700",
    AuditorConsulta: "bg-green-100 text-green-700",
  };

  // Obtiene el color correspondiente al rol
  // Si el rol no existe en el listado, utiliza un color neutro
  const color =
    colores[nombre] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {nombre}
    </span>
  );
}