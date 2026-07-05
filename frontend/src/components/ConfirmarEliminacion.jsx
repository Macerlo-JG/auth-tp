// Modal de confirmacion eliminacion
// Recibe:
// - mensaje: texto que se muestra al usuario
// - onConfirmar: accion a ejecutar al confirmar
// - onCancelar: accion para cerrar el modal

export default function ConfirmarEliminacion({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Confirmar eliminación
        </h2>
        <p className="text-gray-600 mb-6">{mensaje}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancelar} className="btn-cancel">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-md transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
