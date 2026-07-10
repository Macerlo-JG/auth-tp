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

import {
  eliminarUsuario,
  ESTADOS_USUARIO,
} from "../api/usuarios.js";

import { getListadoUsuarios } from "../services/usuariosService.js";
import { formatearId } from "../utils/format.js";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ListadoUsuarios() {
  // Estados

  const { hasPermission } = useContext(AuthContext);
  // Listado completo obtenido desde el backend.
  const [usuarios, setUsuarios] = useState([]);

  // Resultado luego de aplicar búsqueda y filtros.
  const [filtro, setFiltro] = useState([]);

  // Texto ingresado en el buscador.
  const [busqueda, setBusqueda] = useState("");

  // Controla el indicador de carga.
  const [cargando, setCargando] = useState(true);

  // Usuario seleccionado para eliminar.
  const [eliminarTarget, setEliminarTarget] = useState(null);

  // Página actual de la tabla.
  const [paginaActual, setPaginaActual] = useState(1);

  // Estado seleccionado en el filtro.
  const [usuariosFiltrados, setUsuariosFiltrados] = useState("");

  // Cantidad de registros mostrados por página.
  const itemsPorPagina = 8;


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
 
  // Filtra el listado de usuarios segun:
  // - Texto de búsqueda
  // - Estado seleccionado (desplegable)
  // El resultado se almacena para mostrarlo en pantalla.

  const aplicarFiltro = (lista, texto, estado) => {
    const q = texto.toLowerCase().trim();

    // Comprueba si el usuario coincide con el texto buscado
    // Se permite buscar por:
    //
    // - Número de usuario
    // - ID de persona
    // - Nombre
    // - Apellido
    // - Email
    // - Nombre completo

    const resultado = lista.filter((u) => {
      const coincideTexto =
        !q ||
        formatearId(u.id_usuario).includes(q) ||
        String(u.id_persona).includes(q) ||
        u.persona?.nombre?.toLowerCase().includes(q) ||
        u.persona?.apellido?.toLowerCase().includes(q) ||
        u.persona?.email?.toLowerCase().includes(q) ||
        `${u.persona?.nombre ?? ""} ${u.persona?.apellido ?? ""}`
          .toLowerCase()
          .includes(q);

      // Comprueba si coincide con el estado seleccionado.
      const coincideEstado =
        !estado || u.estado_usuario === estado;

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
                className="form-input pl-10"/>
            </div>

            <select value={usuariosFiltrados}onChange={handleEstado} className="form-input w-full sm:w-56">
              <option value="">Todos los estados</option>
              {ESTADOS_USUARIO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

          </div>
          {hasPermission("usuarios.crear") && (
            <Link to="/usuarios/nuevo" className="btn-bomberos shrink-0">
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
                    <td className="table-td font-medium text-gray-800">
                      {formatearId(usuario.id_usuario)}
                    </td>
                    <td className="table-td">
                      {usuario.persona.nombre}
                    </td>
                    <td className="table-td">
                      {usuario.persona.apellido}
                    </td>
                    <td className="table-td">
                      {usuario.persona.email}
                    </td>
                    <td className="table-td">
                      {usuario.id_persona}</td>
                    <td className="table-td">
                      <EstadoBadge estado={usuario.estado_usuario}/>
                    </td>
                    <td className="table-td">
                      {usuario.created_by}
                    </td>
                    <td className="table-td">
                      {usuario.updated_by ?? "—"}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-4">

                        {hasPermission("usuarios.ver")&& (
                        <Link
                          to={`/usuarios/${usuario.id_usuario}`}
                          className="action-link action-ver"
                        >
                          <IconEye />
                          Ver
                        </Link>
                        ) }

                        {hasPermission("usuarios.editar")&& (
                          <Link
                          to={`/usuarios/${usuario.id_usuario}/editar`}
                          className="action-link action-editar"
                        >
                          <IconPencil />
                          Editar
                        </Link>
                        )}
                        
                        {hasPermission("usuarios.eliminar")&& (
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
          <p className="text-sm text-gray-500">
            Mostrando {desde} a {hasta} de {total} usuarios
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaginaActual((p) => p - 1)}
              disabled={paginaActual === 1}
              className={`w-8 h-8 flex items-center justify-center rounded border text-sm ${
                paginaActual === 1
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-300 hover:bg-gray-300"
              }`}
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
              className={`w-8 h-8 flex items-center justify-center rounded border text-sm ${
                paginaActual === totalPaginas
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-300 hover:bg-gray-300"
              }`}
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
