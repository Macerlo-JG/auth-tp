import { useEffect, useState, } from "react";
import useAuth from "../auth/hooks/useAuth.js";
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

import {
  eliminarUsuario,
  ESTADOS_USUARIO,
} from "../api/usuarios.js";

import { getListadoUsuarios } from "../services/usuariosService.js";
import { formatearId } from "../utils/format.js";
import { HOME_ROUTE } from "../auth/config.js";

export default function ListadoUsuarios() {
  const { hasPermission } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Usuario seleccionado para eliminar.
  const [eliminarTarget, setEliminarTarget] = useState(null);

  // Página actual de la tabla.
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState("");
  const itemsPorPagina = 10;

  // Obtiene el listado de usuarios desde el servicio
  // Despues aplica los filtros actuales
  const cargarUsuarios = async () => {
    try {
      const lista = await getListadoUsuarios();
      setUsuarios(lista);
      aplicarFiltro(lista, busqueda, usuariosFiltrados);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };
  //Filtro de búsqueda y estado  de usuario/s.
  const aplicarFiltro = (lista, texto, estado) => {
    const q = texto.toLowerCase().trim();
    //Compruebo si el usuario coincide con lo buscado
    const resultado = lista.filter((u) => {
      const coincideTexto =
        !q ||
        formatearId(u.id_usuario).includes(q) ||
        String(u.id_persona).includes(q) ||
        u.persona?.nombre?.toLowerCase().includes(q) ||
        u.persona?.apellido?.toLowerCase().includes(q) ||
        u.persona?.email?.toLowerCase().includes(q) ||
        `${u.persona?.nombre ?? ""} ${u.persona?.apellido ?? ""}`.toLowerCase().includes(q);

      const coincideEstado = !estado || u.estado_usuario === estado;

      return coincideTexto && coincideEstado;
    });

    setFiltro(resultado);
  };

  // Carga inicial del listado.
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Actualiza la busqueda y vuelve a aplicar los filtros y reinicia la paginacion
  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setPaginaActual(1);
    aplicarFiltro(usuarios, valor, usuariosFiltrados);
  };

  // Actualiza el estado seleccionado y vuelve a filtrar el listado
  const handleEstado = (e) => {
    const valor = e.target.value;
    setUsuariosFiltrados(valor);
    setPaginaActual(1);
    aplicarFiltro(usuarios, busqueda, valor);
  };

  // Elimina el usuario seleccionado y carga la lista
  const handleEliminar = async () => {
    if (!eliminarTarget) return;
    try {
      const { ok, body } = await eliminarUsuario(eliminarTarget.id_usuario);
      if (ok) {
        toast.success(body.message || "Usuario eliminado");
      } else {
        toast.error(body.message || "No se pudo eliminar");
      }
      await cargarUsuarios();
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar");
    } finally {
      setEliminarTarget(null);
    }
  };

// Cantidad total de registros
  const total = filtro.length;
// Número total de páginas
  const totalPaginas = Math.ceil(total / itemsPorPagina);
// Indices del primer y ultimo registro de la pagina
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
// Usuarios que se mostraran en la pagina actual
  const usuariosPagina = filtro.slice(indiceInicio, indiceFin);
// Texto "Mostrando X a Y de Z"
  const desde = total === 0 ? 0 : indiceInicio + 1;
  const hasta = Math.min(indiceFin, total);

  return (
    <Layout>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Listado de Usuarios</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <IconSearch className="search-icon" />
              <input
                type="search"
                value={busqueda}
                onChange={handleBusqueda}
                placeholder="Buscar por usuario, persona o email"
                className="form-input pl-10" />
            </div>

            <select value={usuariosFiltrados} onChange={handleEstado} className="form-input w-full sm:w-56">
              <option value="">Todos los estados</option>
              {ESTADOS_USUARIO.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          {/* Antes usaba "usuarios.control_parcial", que ya no existe:
              ahora crear un usuario es un permiso propio. */}
          {hasPermission("auth.usuarios.crear") && (
            <Link to={`${HOME_ROUTE}/nuevo`} className="btn-bomberos shrink-0">
              <span className="text-lg leading-none">+</span>
              Nuevo usuario
            </Link>
          )}
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
                  <th className="table-th">Nombre</th>
                  <th className="table-th">Apellido</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">ID Persona</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Creado por</th>
                  <th className="table-th">Modificado por</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPagina.map((usuario) => (
                  <tr key={usuario.id_usuario} className="hover:bg-gray-50/80">
                    <td className="table-td font-medium text-gray-800">{formatearId(usuario.id_usuario)}</td>
                    <td className="table-td">{usuario.persona.nombre}</td>
                    <td className="table-td">{usuario.persona.apellido}</td>
                    <td className="table-td">{usuario.persona.email}</td>
                    <td className="table-td">{usuario.id_persona}</td>
                    <td className="table-td"><EstadoBadge estado={usuario.estado_usuario} /></td>
                    <td className="table-td">{usuario.created_by}</td>
                    <td className="table-td">{usuario.updated_by ?? "—"}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-4">
                        {hasPermission("auth.usuarios.ver") && (
                          <Link to={`${HOME_ROUTE}/${usuario.id_usuario}`} className="action-link action-ver">
                            <IconEye />
                            Ver
                          </Link>
                        )}

                        {/* Antes "usuarios.control_parcial", ahora
                            "usuarios.editar" es su propio permiso. */}
                        {hasPermission("auth.usuarios.editar") && (
                          <Link to={`${HOME_ROUTE}/${usuario.id_usuario}/editar`} className="action-link action-editar">
                            <IconPencil />
                            Editar
                          </Link>
                        )}

                        {/* Eliminar ya tenía su propio permiso
                            ("usuarios.eliminar"), no cambió. */}
                        {hasPermission("auth.usuarios.eliminar") && (
                          <button
                            type="button"
                            onClick={() => setEliminarTarget(usuario)}
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
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Mostrando {desde} a {hasta} de {total} usuarios</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaginaActual((p) => p - 1)}
              disabled={paginaActual === 1}
              className={`w-8 h-8 flex items-center justify-center rounded border text-sm ${paginaActual === 1 ? "border-gray-200 text-gray-400" : "border-gray-300 hover:bg-gray-300"}`}
            >
              ‹
            </button>
            <span className="w-8 h-8 flex items-center justify-center rounded bg-bomberos text-white text-sm font-semibold">
              {paginaActual}
            </span>
            <button
              type="button"
              onClick={() => setPaginaActual((p) => p + 1)}
              disabled={paginaActual === totalPaginas}
              className={`w-8 h-8 flex items-center justify-center rounded border text-sm ${paginaActual === totalPaginas ? "border-gray-200 text-gray-400" : "border-gray-300 hover:bg-gray-300"}`}
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