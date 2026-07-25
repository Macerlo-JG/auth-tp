import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import useAuth from "../auth/hooks/useAuth.js";
import Layout from "../components/layout/Layout.jsx";
import TablaRoles from "../components/roles/TablaRoles.jsx";
import ModalRol from "../components/roles/ModalRol.jsx";
import ConfirmarEliminarRol from "../components/roles/ConfirmarEliminarRol.jsx";

import { obtenerRoles, eliminarRol, reactivarRol } from "../services/rolesService.js";

export default function RolesPage() {
  const { hasPermission } = useAuth();

  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Rol en edición. null = modal cerrado o modo creación.
  const [rolEditar, setRolEditar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eliminarTarget, setEliminarTarget] = useState(null);

  // Solo quien puede administrar roles ve también los inactivos.
  const puedeVerInactivos = hasPermission("auth.roles.control_parcial");

  const cargarRoles = async () => {
    try {
      const lista = await obtenerRoles(puedeVerInactivos);
      setRoles(lista);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al cargar roles");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const handleNuevo = () => {
    setRolEditar(null);
    setMostrarModal(true);
  };

  const handleEditar = (rol) => {
    setRolEditar(rol);
    setMostrarModal(true);
  };

  const handleGuardado = async () => {
    setMostrarModal(false);
    setRolEditar(null);
    await cargarRoles();
  };

  const handleEliminar = async () => {
    if (!eliminarTarget) return;
    try {
      await eliminarRol(eliminarTarget.id_rol);
      toast.success("Rol eliminado");
      await cargarRoles();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo eliminar el rol");
    } finally {
      setEliminarTarget(null);
    }
  };

  const handleReactivar = async (rol) => {
    try {
      await reactivarRol(rol.id_rol);
      toast.success("Rol reactivado");
      await cargarRoles();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo reactivar el rol");
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Roles</h1>
          {hasPermission("auth.roles.control_parcial") && (
            <button type="button" onClick={handleNuevo} className="btn-bomberos shrink-0">
              <span className="text-lg leading-none">+</span>
              Nuevo rol
            </button>
          )}
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 py-12">Cargando roles...</p>
        ) : (
          <TablaRoles
            roles={roles}
            onEditar={handleEditar}
            onEliminar={setEliminarTarget}
            onReactivar={handleReactivar}
          />
        )}
      </div>

      {mostrarModal && (
        <ModalRol rol={rolEditar} onClose={() => setMostrarModal(false)} onGuardado={handleGuardado} />
      )}

      {eliminarTarget && (
        <ConfirmarEliminarRol rol={eliminarTarget} onCancelar={() => setEliminarTarget(null)} onConfirmar={handleEliminar} />
      )}
    </Layout>
  );
}