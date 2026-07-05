import { useState } from "react";
import { IconTrash } from "./icons";
import ModalAgregarRol from "./ModalAgregarRol";

// Componente encargado de administrar los roles de un usuario durante la edición
// Permite:
// - Visualizar los roles actuales.
// - Eliminar roles de la lista.
// - Agregar nuevos roles mediante un modal.

export default function UsuarioRoles({
  roles,
  setRoles,
  idUsuario,
}) {

  // Controla la visibilidad del modal para agregar roles.
  const [mostrarModal, setMostrarModal] = useState(false);

  // Elimina un rol de la lista utilizando su id.
  const eliminarRol = (idRol) => {
    setRoles((actuales) =>
      actuales.filter((rol) => rol.id_rol !== idRol)
    );
  };

  // Agrega un rol unicamente si todavia no fue asignado.
  // Evita duplicados dentro de la lista.
  const agregarRol = (rol) => {
    setRoles((actuales) => {
      // Si el rol ya existe, no realiza cambios.
      if (actuales.some((r) => r.id_rol === rol.id_rol)) {
        return actuales;
      }
      // Agrega el nuevo rol al listado.
      return [...actuales, rol];
    });
  };

  return (
    <>
      {}
      <h2 className="form-section-title">
        Roles
      </h2>

      <div className="space-y-2">

        {}
        {roles.length === 0 ? (

          <p className="text-gray-500">
            El usuario no posee roles.
          </p>

        ) : (

          <div className="flex flex-wrap gap-3">
            {roles.map((rol) => (
              <div key={rol.id_rol}className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2">
                {}
                <span>{rol.nombre}</span>
                {}
                <button type="button"
                  onClick={() => eliminarRol(rol.id_rol)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors">
                  <IconTrash />
                </button>

              </div>

            ))}

          </div>

        )}

        {}
        <button
          type="button"
          className="btn-bomberos mt-3"
          onClick={() => setMostrarModal(true)}
        >
          + Agregar Rol
        </button>

      </div>

      {}
      {mostrarModal && (
        <ModalAgregarRol
          idUsuario={idUsuario}
          onClose={() => setMostrarModal(false)}
          onRolAgregado={agregarRol}
        />
      )}
    </>
  );
}