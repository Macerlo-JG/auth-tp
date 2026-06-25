const ESTILOS = {
  ACTIVO: "bg-green-100 text-green-700",
  INACTIVO: "bg-orange-100 text-orange-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  BLOQUEADO: "bg-red-100 text-red-700",
};

export default function EstadoBadge({ estado }) {
  const clases = ESTILOS[estado] || ESTILOS.INACTIVO;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${clases}`}>
      {estado}
    </span>
  );
}
