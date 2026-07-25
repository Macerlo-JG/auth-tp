import useAuth from "../../auth/hooks/useAuth.js";
import RolBadge from "./RolBadge.jsx";
import { IconPencil, IconTrash } from "../icons.jsx";

export default function TablaRoles({ roles, onEditar, onEliminar, onReactivar }) {

  const ROLES_PROTEGIDOS = ["ADMINISTRADOR", "administrador roles"];


  const { hasPermission } = useAuth();

  if (roles.length === 0) {
    return <p className="text-center text-gray-500 py-12">No hay roles para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr>
            <th className="table-th">Rol</th>
            <th className="table-th">Descripción</th>
            <th className="table-th">Acciones asignadas</th>
            <th className="table-th">Estado</th>
            <th className="table-th">Creado por</th>
            <th className="table-th">Modificado por</th>
            <th className="table-th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id_rol} className="hover:bg-gray-50/80">
              <td className="table-td"><RolBadge nombre={rol.nombre} /></td>
              <td className="table-td text-gray-600">{rol.descripcion}</td>
              <td className="table-td text-gray-600">{rol.acciones?.length ?? 0}</td>
              <td className="table-td">
                {rol.activo ? (
                  <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">Activo</span>
                ) : (
                  <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Inactivo</span>
                )}
              </td>
              <td className="table-td">{rol.created_by}</td>
              <td className="table-td">{rol.updated_by ?? "—"}</td>
              <td className="table-td">
                <div className="flex items-center gap-4">
                  {rol.activo && hasPermission("auth.roles.control_parcial") && (
                    <button type="button" onClick={() => onEditar(rol)} className="action-link action-editar">
                      <IconPencil />
                      Editar
                    </button>
                  )}
                  {rol.activo && !ROLES_PROTEGIDOS.includes(rol.nombre) && hasPermission("auth.roles.eliminar") && (
                    <button type="button" onClick={() => onEliminar(rol)} className="action-link action-eliminar">
                      <IconTrash />
                      Eliminar
                    </button>
                  )}
                  {!rol.activo && hasPermission("auth.roles.control_parcial") && (
                    <button type="button" onClick={() => onReactivar(rol)} className="action-link action-editar">
                      Reactivar
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