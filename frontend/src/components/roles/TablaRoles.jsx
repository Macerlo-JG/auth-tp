import useAuth from "../../auth/hooks/useAuth.js";
import RolBadge from "./RolBadge.jsx";
import { IconPencil, IconTrash } from "../icons.jsx";

// Tabla de roles. Las acciones de editar/eliminar se muestran u
// ocultan según los permisos del usuario logueado.
export default function TablaRoles({ roles, onEditar, onEliminar }) {
  const { hasPermission } = useAuth();

  if (roles.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">
        No hay roles para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr>
            <th className="table-th">Rol</th>
            <th className="table-th">Descripción</th>
            <th className="table-th">Acciones asignadas</th>
            <th className="table-th">Creado por</th>
            <th className="table-th">Modificado por</th>
            <th className="table-th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id_rol} className="hover:bg-gray-50/80">
              <td className="table-td">
                <RolBadge nombre={rol.nombre} />
              </td>
              <td className="table-td text-gray-600">{rol.descripcion}</td>
              <td className="table-td text-gray-600">
                {rol.acciones?.length ?? 0}
              </td>
              <td className="table-td">{rol.created_by}</td>
              <td className="table-td">{rol.updated_by ?? "—"}</td>
              <td className="table-td">
                <div className="flex items-center gap-4">
                  {hasPermission("auth.roles.control_parcial") && (
                    <button
                      type="button"
                      onClick={() => onEditar(rol)}
                      className="action-link action-editar"
                    >
                      <IconPencil />
                      Editar
                    </button>
                  )}

                  {hasPermission("auth.roles.eliminar") && (
                    <button
                      type="button"
                      onClick={() => onEliminar(rol)}
                      className="action-link action-eliminar"
                    >
                      <IconTrash />
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
