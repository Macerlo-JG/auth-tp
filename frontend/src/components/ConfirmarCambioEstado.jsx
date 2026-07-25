// Modal de confirmación para bloquear o inactivar un usuario.
// Reemplaza el window.confirm() básico del navegador por algo
// consistente con el resto de los modales de la app.
export default function ConfirmarCambioEstado({ nuevoEstado, onCancelar, onConfirmar }) {
  const esBloqueo = nuevoEstado === "BLOQUEADO";

  const titulo = esBloqueo ? "Bloquear usuario" : "Marcar como inactivo";
  const colorBoton = esBloqueo
    ? "bg-red-600 hover:bg-red-700"
    : "bg-gray-600 hover:bg-gray-700";

  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-md">
        <h2 className="text-xl font-bold mb-3">{titulo}</h2>
        <p className="text-sm text-gray-600 mb-6">
          ¿Seguro que querés {esBloqueo ? "bloquear" : "marcar como inactivo"} a este usuario?
          Esto cerrará su sesión activa de inmediato.
        </p>

        <div className="flex justify-center gap-3">
          <button type="button" className="btn-cancel" onClick={onCancelar}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className={`text-white font-medium px-4 py-2 rounded-md transition ${colorBoton}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}