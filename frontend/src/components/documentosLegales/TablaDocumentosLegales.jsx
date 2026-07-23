import { IconEye, IconClock, IconUpload } from "../icons.jsx";
import { obtenerLabelTipo, obtenerCatalogoTipos } from "../../utils/tiposDocumentoLegal.js";
import { formatearFecha } from "../../utils/format.js";

// Tabla de tipos de documento legal (uno por fila), con la versión
// vigente de cada uno y accesos a ver el PDF, subir una nueva versión
// y ver el historial completo. Mismo patrón visual que TablaRoles.
export default function TablaDocumentosLegales({ grupos, onVerPdf, onNuevaVersion, onVerHistorial }) {
  const catalogo = obtenerCatalogoTipos();

  // Tipos del catálogo que todavía no tienen ningún documento cargado.
  const tiposFaltantes = Object.keys(catalogo).filter(
    (tipo) => !grupos.some((g) => g.tipo === tipo)
  );

  if (grupos.length === 0 && tiposFaltantes.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">
        No hay tipos de documento para mostrar.
      </p>
    );
  }

  const aplicaA = (tipo) => {
    const roles = catalogo[tipo]?.rolesRequeridos;
    return roles?.length ? roles.join(", ") : "Todos los usuarios";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr>
            <th className="table-th">Documento</th>
            <th className="table-th">Versión vigente</th>
            <th className="table-th">Vigente desde</th>
            <th className="table-th">Aplica a</th>
            <th className="table-th">Estado</th>
            <th className="table-th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => (
            <tr key={grupo.tipo} className="hover:bg-gray-50/80">
              <td className="table-td font-medium text-gray-800">
                {obtenerLabelTipo(grupo.tipo)}
              </td>
              <td className="table-td text-gray-600">
                {grupo.vigente ? grupo.vigente.version : "—"}
              </td>
              <td className="table-td text-gray-600">
                {grupo.vigente ? formatearFecha(grupo.vigente.fecha_publicacion) : "—"}
              </td>
              <td className="table-td text-gray-600">{aplicaA(grupo.tipo)}</td>
              <td className="table-td">
                {grupo.vigente ? (
                  <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    Vigente
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Sin versión</span>
                )}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-4">
                  {grupo.vigente && (
                    <button
                      type="button"
                      onClick={() => onVerPdf(grupo.vigente)}
                      className="action-link action-ver"
                    >
                      <IconEye />
                      Ver
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onVerHistorial(grupo)}
                    className="action-link action-editar"
                  >
                    <IconClock />
                    Historial ({grupo.historial.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => onNuevaVersion(grupo.tipo)}
                    className="action-link action-editar"
                  >
                    <IconUpload />
                    Nueva versión
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {tiposFaltantes.map((tipo) => (
            <tr key={tipo} className="hover:bg-gray-50/80">
              <td className="table-td font-medium text-gray-800">{catalogo[tipo].label}</td>
              <td className="table-td text-gray-400" colSpan={3}>
                Todavía no tiene ningún documento cargado.
              </td>
              <td className="table-td">
                <span className="text-xs text-gray-400">Sin versión</span>
              </td>
              <td className="table-td">
                <button
                  type="button"
                  onClick={() => onNuevaVersion(tipo)}
                  className="action-link action-editar"
                >
                  <IconUpload />
                  Cargar documento
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
