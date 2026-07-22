// Modal de confirmación para eliminar (dar de baja) un rol.
// El backend hace soft-delete: el rol pasa a activo=False y se propaga
// el cambio a los usuarios que lo tuvieran asignado.
export default function ConfirmarEliminarRol({ rol, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Confirmar eliminación
        </h2>
        <p className="text-gray-600 mb-6">
          ¿Seguro que querés eliminar el rol <strong>{rol.nombre}</strong>?
          Los usuarios que lo tengan asignado perderán los permisos asociados
          a este rol.
        </p>
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
