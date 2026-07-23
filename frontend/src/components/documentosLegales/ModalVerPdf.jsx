import VisorPdf from "./VisorPdf.jsx";
import { IconX } from "../icons.jsx";

// Visor genérico de un documento puntual (se usa desde la tarjeta y
// desde el historial de versiones). zIndex más alto que el modal de
// historial, por si se abre uno desde adentro del otro.
export default function ModalVerPdf({ documento, onClose }) {
  if (!documento) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }}>
      <div className="modal-card w-full max-w-3xl h-[90vh] sm:h-[85vh] max-h-none flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">{documento.titulo}</h2>
            <p className="text-xs text-gray-500">Versión {documento.version}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <IconX />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <VisorPdf contenido={documento.contenido} titulo={documento.titulo} />
        </div>
      </div>
    </div>
  );
}
