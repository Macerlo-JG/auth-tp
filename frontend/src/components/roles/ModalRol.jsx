import FormularioRol from "./FormularioRol.jsx";

// Modal contenedor del formulario de creación/edición de un rol.
// rol=null → modo creación. rol={...} → modo edición.
export default function ModalRol({ rol, onClose, onGuardado }) {
  const esEdicion = Boolean(rol);

  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-xl">
        <h2 className="text-xl font-bold mb-5">
          {esEdicion ? "Editar Rol" : "Nuevo Rol"}
        </h2>

        <FormularioRol rol={rol} onCancelar={onClose} onGuardado={onGuardado} />
      </div>
    </div>
  );
}
