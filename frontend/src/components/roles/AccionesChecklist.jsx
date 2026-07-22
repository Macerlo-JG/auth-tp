import { useMemo } from "react";
import { agruparAcciones } from "../../utils/agruparAcciones";

// Muestra el catálogo de acciones agrupado por servicio, con checkboxes
// para elegir cuáles quedan vinculadas al rol.
// - acciones: catálogo completo (todas las disponibles).
// - seleccionadas: array de id_accion actualmente elegidos.
// - onChange: recibe el nuevo array de id_accion seleccionados.
export default function AccionesChecklist({ acciones, seleccionadas, onChange }) {
  const grupos = useMemo(() => agruparAcciones(acciones), [acciones]);

  const estaSeleccionada = (idAccion) => seleccionadas.includes(idAccion);

  // Agrega o quita una acción puntual de la selección.
  const toggleAccion = (idAccion) => {
    if (estaSeleccionada(idAccion)) {
      onChange(seleccionadas.filter((id) => id !== idAccion));
    } else {
      onChange([...seleccionadas, idAccion]);
    }
  };

  // Selecciona o deselecciona todas las acciones de un servicio a la vez.
  const toggleGrupo = (accionesGrupo) => {
    const idsGrupo = accionesGrupo.map((accion) => accion.id_accion);
    const todasSeleccionadas = idsGrupo.every((id) => seleccionadas.includes(id));

    if (todasSeleccionadas) {
      onChange(seleccionadas.filter((id) => !idsGrupo.includes(id)));
    } else {
      const nuevos = new Set([...seleccionadas, ...idsGrupo]);
      onChange(Array.from(nuevos));
    }
  };

  if (grupos.length === 0) {
    return <p className="text-gray-500 text-sm">No hay acciones disponibles.</p>;
  }

  return (
    <div className="space-y-4 max-h-72 overflow-y-auto border border-gray-200 rounded-md p-4">
      {grupos.map(({ servicio, acciones: accionesGrupo }) => {
        const idsGrupo = accionesGrupo.map((accion) => accion.id_accion);
        const todasSeleccionadas = idsGrupo.every((id) => seleccionadas.includes(id));

        return (
          <div key={servicio}>
            <label className="flex items-center gap-2 font-semibold text-sm text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={todasSeleccionadas}
                onChange={() => toggleGrupo(accionesGrupo)}
              />
              {servicio}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
              {accionesGrupo.map((accion) => (
                <label
                  key={accion.id_accion}
                  className="flex items-center gap-2 text-sm text-gray-600"
                  title={accion.descripcion}
                >
                  <input
                    type="checkbox"
                    checked={estaSeleccionada(accion.id_accion)}
                    onChange={() => toggleAccion(accion.id_accion)}
                  />
                  {accion.nombre}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
