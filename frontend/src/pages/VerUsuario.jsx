import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import RolBadge from "../components/RolBadge.jsx";
import { IconPencil } from "../components/icons.jsx";

import { getUsuarioDetalle } from "../services/usuariosService.js";

import { formatearId, formatearFecha } from "../utils/format.js";

export default function VerUsuario() {

  // Hooks

  // -----Obtiene el id recibido por la URL
  const { id } = useParams();

  // Permite realizar redirecciones
  const navigate = useNavigate();

  // Estados

  // -----Informacion del usuario
  const [usuario, setUsuario] = useState(null);

  // Controla la pantalla de carga
  const [cargando, setCargando] = useState(true);

  // Carga inicial
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        // Obtiene toda la informacion necesaria del usuario
        // El servicio ya incluye los datos de la persona y sus roles
        const usuario = await getUsuarioDetalle(id);

        // Si el usuario no existe, vuelve al listado
        if (!usuario) {
          toast.error("Usuario no encontrado");
          navigate("/usuarios");
          return;
        }

        // Guarda la información en el estado
        setUsuario(usuario);

      } catch (error) {
        // Si ocurre un error cualquiera se informa al usuario y se vuelve al listado
        toast.error("Error al cargar el usuario");
        navigate("/usuarios");

      } finally {
        // Finaliza el estado de carga
        setCargando(false);
      }
    };

    cargarUsuario();
  }, [id, navigate]);

  // Mientras se obtienen los datos se muestra un indicador de carga.
  if (cargando) {
    return (
      <Layout>
        <p className="text-center text-gray-500 py-12">
          Cargando...
        </p>
      </Layout>
    );
  }

  // Datos que se ven en pantalla
  const campos = [
    {label: "N° Usuario", valor: formatearId(usuario.id_usuario),},
    {label: "Nombre", valor: usuario.persona.nombre,},
    {label: "Apellido",valor: usuario.persona.apellido,},

    {label: "Roles", valor: usuario.roles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {usuario.roles.map((rol) => (
              <RolBadge key={rol.id_rol} nombre={rol.nombre}/>)
              )}
          </div> ) : ("Sin roles"),
    },

    {label: "Estado", valor: (<EstadoBadge estado={usuario.estado_usuario} />),},
    {label: "Creado por",valor: usuario.created_by,},
    {label: "Modificado por", valor: usuario.updated_by ?? "—",},
    {label: "Fecha de creación",valor: formatearFecha(usuario.created_at),},
    {label: "Última actualización", valor: formatearFecha(usuario.updated_at),},
  ];

  return (
    <Layout>

      {}
      <Breadcrumbs
        items={[
          {label: "Usuarios", to: "/usuarios",},
          {label: formatearId(usuario.id_usuario),},
        ]}
      />

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Usuario {formatearId(usuario.id_usuario)}
          </h1>

          <p className="text-gray-500 mt-1">
            Detalle del registro de usuario.
          </p>
        </div>

        {}
        <Link
          to={`/usuarios/${usuario.id_usuario}/editar`}
          className="btn-bomberos"
        >
          <IconPencil className="w-4 h-4" />
          Editar
        </Link>

      </div>

      {}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          {campos.map((campo) => (
            <div key={campo.label}>

              <p className="text-sm font-semibold text-gray-500 mb-1">
                {campo.label}
              </p>

              <div className="text-gray-800 font-medium">
                {campo.valor}
              </div>

            </div>
          ))}

        </div>

        {}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Link
            to="/usuarios"
            className="btn-cancel"
          >Volver al listado</Link>
        </div>

      </div>
    </Layout>
  );
}