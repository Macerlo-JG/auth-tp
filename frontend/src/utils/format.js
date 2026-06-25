export function formatearId(numero, digitos = 6) {
  return String(numero).padStart(digitos, "0");
}

export function formatearFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
