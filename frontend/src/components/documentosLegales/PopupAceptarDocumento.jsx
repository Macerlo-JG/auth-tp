import { useEffect, useState } from "react";
import { IconFileText, IconX } from "../icons.jsx";
import VisorPdf from "./VisorPdf.jsx";
import { obtenerLabelTipo } from "../../utils/tiposDocumentoLegal.js";

const SEGUNDOS_ESPERA = 10;

// Popup obligatorio de aceptación de un documento legal (T&C, reglamento,
// etc.). El botón "Aceptar" queda deshabilitado los primeros
// SEGUNDOS_ESPERA segundos, para asegurar que el usuario tuvo tiempo de
// leer el documento antes de poder confirmarlo.
export default function PopupAceptarDocumento({ documento, onAceptar, onCancelar }) {
  const [segundosRestantes, setSegundosRestantes] = useState(SEGUNDOS_ESPERA);
  const [procesando, setProcesando] = useState(false);

  // Reinicia el temporizador cada vez que cambia el documento mostrado
  // (por ejemplo, al pasar al siguiente de la cola de pendientes).
  useEffect(() => {
    setSegundosRestantes(SEGUNDOS_ESPERA);

    const intervalo = setInterval(() => {
      setSegundosRestantes((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [documento?.id_documento]);

  if (!documento) return null;

  const puedeAceptar = segundosRestantes === 0 && !procesando;

  const handleAceptarClick = async () => {
    setProcesando(true);
    try {
      await onAceptar();
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1400 }}>
      <div className="modal-card w-full max-w-3xl h-[90vh] sm:h-[85vh] max-h-none flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <IconFileText className="text-bomberos shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-tight truncate">
              {documento.titulo}
            </h2>
            <p className="text-xs text-gray-500">
              {obtenerLabelTipo(documento.tipo)} · versión {documento.version}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Para continuar usando el sistema, necesitás leer y aceptar este documento.
        </p>

        <div className="flex-1 min-h-0 mb-4">
          <VisorPdf contenido={documento.contenido} titulo={documento.titulo} />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancelar}
            className="btn-cancel w-full sm:w-auto justify-center"
          >
            <IconX />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAceptarClick}
            disabled={!puedeAceptar}
            className="btn-save w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando
              ? "Guardando..."
              : segundosRestantes > 0
              ? `Aceptar (${segundosRestantes}s)`
              : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}
