export default function RolBadge({ nombre }) {
  const colores = {
    Administrador: "bg-red-100 text-red-700",
    Operador: "bg-blue-100 text-blue-700",
    Supervisor: "bg-green-100 text-green-700",
  };

  const color = colores[nombre] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}
    >
      {nombre}
    </span>
  );
}