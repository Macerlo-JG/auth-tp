import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import EstadoBadge from "../components/EstadoBadge.jsx";
import { IconPencil } from "../components/icons.jsx";
import { getUsuario } from "../api.js";
import { formatearId, formatearFecha } from "../utils/format.js";

export default function VerUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getUsuario(id)
      .then((data) => {
        if (data.ok && data.data?.[0]) {
          setUsuario(data.data[0]);
        } else {
          toast.error("Usuario no encontrado");
          navigate("/usuarios");
        }
      })
      .catch(() => {
        toast.error("Error al cargar usuario");
        navigate("/usuarios");
      })
      .finally(() => setCargando(false));
  }, [id, navigate]);

  if (cargando) {
    return (
      <Layout>
        <p className="text-center text-gray-500 py-12">Cargando...</p>
      </Layout>
    );
  }

  const campos = [
    { label: "N° Usuario", valor: formatearId(usuario.id_usuario) },
    { label: "ID Persona", valor: usuario.id_persona },
    { label: "Estado", valor: <EstadoBadge estado={usuario.estado_usuario} /> },
    { label: "Creado por", valor: usuario.created_by },
    { label: "Modificado por", valor: usuario.updated_by ?? "—" },
    { label: "Fecha de creación", valor: formatearFecha(usuario.created_at) },
    { label: "Última actualización", valor: formatearFecha(usuario.updated_at) },
  ];

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Usuarios", to: "/usuarios" },
          { label: formatearId(usuario.id_usuario) },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Usuario {formatearId(usuario.id_usuario)}
          </h1>
          <p className="text-gray-500 mt-1">Detalle del registro de usuario.</p>
        </div>
        <Link
          to={`/usuarios/${usuario.id_usuario}/editar`}
          className="btn-bomberos"
        >
          <IconPencil className="w-4 h-4" />
          Editar
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campos.map((campo) => (
            <div key={campo.label}>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                {campo.label}
              </p>
              <p className="text-gray-800 font-medium">{campo.valor}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Link to="/usuarios" className="btn-cancel">
            Volver al listado
          </Link>
        </div>
      </div>
    </Layout>
  );
}
