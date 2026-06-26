import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import ConfirmarEliminacion from "../components/ConfirmarEliminacion.jsx";
import {
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
} from "../components/icons.jsx";
import { getUsuarios, eliminarUsuario } from "../api.js";
import { formatearId } from "../utils/format.js";

export default function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [eliminarTarget, setEliminarTarget] = useState(null);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsuarios();
      if (data.ok) {
        const lista = data.data || [];
        setUsuarios(lista);
        aplicarFiltro(lista, busqueda);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltro = (lista, texto) => {
    const q = texto.toLowerCase().trim();
    if (!q) {
      setFiltro(lista);
      return;
    }
    setFiltro(
      lista.filter(
        (u) =>
          formatearId(u.id_usuario).includes(q) ||
          String(u.id_persona).includes(q) ||
          u.estado_usuario?.toLowerCase().includes(q),
      ),
    );
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    aplicarFiltro(usuarios, valor);
  };

  const handleEliminar = async () => {
    if (!eliminarTarget) return;
    try {
      const { ok, body } = await eliminarUsuario(eliminarTarget.id_usuario);
      if (ok) {
        toast.success(body.message || "Usuario eliminado");
        await cargarUsuarios();
      } else {
        toast.error(body.message || "No se pudo eliminar");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar");
    } finally {
      setEliminarTarget(null);
    }
  };

  const total = filtro.length;
  const desde = total > 0 ? 1 : 0;
  const hasta = total;

  return (
    <Layout>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Listado de Usuarios</h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <IconSearch className="search-icon" />
            <input
              type="search"
              value={busqueda}
              onChange={handleBusqueda}
              placeholder="Buscar por ID usuario, ID persona o estado"
              className="form-input pl-10"
            />
          </div>
          <Link to="/usuarios/nuevo" className="btn-bomberos shrink-0">
            <span className="text-lg leading-none">+</span>
            Nuevo usuario
          </Link>
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 py-12">Cargando usuarios...</p>
        ) : filtro.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No hay usuarios para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="table-th">N° Usuario</th>
                  <th className="table-th">ID Persona</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Creado por</th>
                  <th className="table-th">Modificado por</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtro.map((usuario) => (
                  <tr key={usuario.id_usuario} className="hover:bg-gray-50/80">
                    <td className="table-td font-medium text-gray-800">
                      {formatearId(usuario.id_usuario)}
                    </td>
                    <td className="table-td">{usuario.id_persona}</td>
                    <td className="table-td">
                      <EstadoBadge estado={usuario.estado_usuario} />
                    </td>
                    <td className="table-td">{usuario.created_by}</td>
                    <td className="table-td">
                      {usuario.updated_by ?? "—"}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/usuarios/${usuario.id_usuario}`}
                          className="action-link action-ver"
                        >
                          <IconEye />
                          Ver
                        </Link>
                        <Link
                          to={`/usuarios/${usuario.id_usuario}/editar`}
                          className="action-link action-editar"
                        >
                          <IconPencil />
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEliminarTarget(usuario)}
                          className="action-link action-eliminar"
                        >
                          <IconTrash />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Mostrando {desde} a {hasta} de {total} usuarios
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 text-sm"
            >
              ‹
            </button>
            <span className="w-8 h-8 flex items-center justify-center rounded bg-bomberos text-white text-sm font-semibold">
              1
            </span>
            <button
              type="button"
              disabled
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 text-sm"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {eliminarTarget && (
        <ConfirmarEliminacion
          mensaje={`¿Seguro que querés eliminar el usuario ${formatearId(eliminarTarget.id_usuario)} (persona ${eliminarTarget.id_persona})?`}
          onCancelar={() => setEliminarTarget(null)}
          onConfirmar={handleEliminar}
        />
      )}
    </Layout>
  );
}
