import { IconEye } from "../icons.jsx";
import { formatearFecha } from "../../utils/format.js";
import { obtenerLabelTipo } from "../../utils/tiposDocumentoLegal.js";

// Historial completo de versiones de un tipo de documento (vigente +
// todas las anteriores), con acceso al PDF de cada una.
export default function ModalHistorialDocumento({ grupo, onClose, onVerPdf }) {
  const { tipo, vigente, historial } = grupo;
  const todas = vigente ? [vigente, ...historial] : historial;

  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-xl">
        <h2 className="text-xl font-bold mb-1">{obtenerLabelTipo(tipo)}</h2>
        <p className="text-sm text-gray-500 mb-4">Historial de versiones</p>

        {todas.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Todavía no hay versiones cargadas.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr>
                  <th className="table-th">Versión</th>
                  <th className="table-th">Vigente desde</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">PDF</th>
                </tr>
              </thead>
              <tbody>
                {todas.map((doc) => (
                  <tr key={doc.id_documento} className="hover:bg-gray-50/80">
                    <td className="table-td">{doc.version}</td>
                    <td className="table-td">{formatearFecha(doc.fecha_publicacion)}</td>
                    <td className="table-td">
                      {doc.vigente ? (
                        <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          Vigente
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Reemplazada</span>
                      )}
                    </td>
                    <td className="table-td">
                      <button
                        type="button"
                        onClick={() => onVerPdf(doc)}
                        className="action-link action-ver"
                      >
                        <IconEye />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
