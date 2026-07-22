// Agrupa una lista plana de acciones por su "servicio".
// Devuelve un array de grupos: [{ servicio, acciones: [...] }, ...]
// ordenado alfabéticamente por servicio, y con las acciones de cada
// grupo ordenadas alfabéticamente por nombre.
export function agruparAcciones(acciones) {
  const grupos = new Map();

  for (const accion of acciones) {
    const clave = accion.servicio;

    if (!grupos.has(clave)) {
      grupos.set(clave, []);
    }

    grupos.get(clave).push(accion);
  }

  return Array.from(grupos.entries())
    .sort(([servicioA], [servicioB]) => servicioA.localeCompare(servicioB))
    .map(([servicio, accionesServicio]) => ({
      servicio,
      acciones: [...accionesServicio].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      ),
    }));
}
