import { useEffect, useState } from "react";

import { getRolesDisponibles } from "../services/usuarioRolesService";

// Modal para seleccionar y agregar un nuevo rol al usuario
// Sólo muestra los roles que el usuario todavía no posee

export default function ModalAgregarRol({
  idUsuario,
  onClose,
  onRolAgregado,
}) {

  // Estados

  // -----Roles disponibles para asignar
  const [roles, setRoles] = useState([]);

  // Rol actualmente seleccionado
  const [rolSeleccionado, setRolSeleccionado] = useState("");

  // Carga los roles disponibles al abrir el modal
  useEffect(() => {
    cargarRoles();
  }, []);

  // Obtiene los roles que todavia no se asignaron al usuario
  const cargarRoles = async () => {

    const lista = await getRolesDisponibles(idUsuario);

    setRoles(lista);

    // Selecciona automaticamente el primer rol disponible si existe
    if (lista.length > 0) {
      setRolSeleccionado(lista[0].id_rol);
    }
  };

  // Agrega el rol seleccionado y cierra el modal
  const handleAgregar = () => {

    // Busca el objeto completo del rol seleccionado
    const rol = roles.find(
      (rol) => rol.id_rol === Number(rolSeleccionado)
    );

    // Si no existe un rol seleccionado, finaliza
    if (!rol) return;

    // Notifica al componente padre el nuevo rol
    onRolAgregado(rol);

    // Cierra el modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center text-center">

      <div className="bg-white rounded-lg w-[420px] p-6">

        <h2 className="text-xl font-bold mb-5">
          Agregar Rol
        </h2>

        {}
        {roles.length === 0 ? (
          <p>No hay roles disponibles.</p>
        ) : (
          <>
            <label className="form-label">
              Rol
            </label>
            {}
            <select
              value={rolSeleccionado}
              onChange={(e) =>
                setRolSeleccionado(e.target.value)
              }
              className="form-input"
            >
              {roles.map((rol) => (
                <option
                  key={rol.id_rol}
                  value={rol.id_rol}
                >
                  {rol.nombre}
                </option>
              ))}
            </select>
          </>
        )}
        {}
        <div className="flex justify-center gap-3 mt-6">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAgregar}
            className="btn-bomberos"
          > Agregar
          </button>
        </div>
      </div>
    </div>
  );
}