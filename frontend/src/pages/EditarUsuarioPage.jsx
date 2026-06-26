import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import {
  IconPerson,
  IconBuilding,
  IconHeart,
  IconSave,
} from "../components/icons.jsx";
import {
  getUsuario,
  editarUsuario,
  ESTADOS_USUARIO,
  parseApiError,
} from "../api.js";
import { formatearId, formatearFecha } from "../utils/format.js";

export default function EditarUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
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

  const handleGuardar = async () => {
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const jsonData = {
      estado_usuario: data.estado_usuario,
      updated_by: parseInt(data.updated_by, 10),
    };

    if (data.id_persona) {
      jsonData.id_persona = parseInt(data.id_persona, 10);
    }

    try {
      const { ok, body } = await editarUsuario(usuario.id_usuario, jsonData);
      if (ok) {
        toast.success(body.message || "Usuario actualizado");
        navigate("/usuarios");
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    }
  };

  if (cargando) {
    return (
      <Layout>
        <p className="text-center text-gray-500 py-12">Cargando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Usuarios", to: "/usuarios" },
          { label: "Editar" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Editar Usuario {formatearId(usuario.id_usuario)}
        </h1>
        <p className="text-gray-500 mt-1">
          Modifique el estado y los datos del usuario.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
        <form ref={formRef}>
          <section className="form-section">
            <h2 className="form-section-title">
              <IconPerson className="text-bomberos" />
              Datos de identificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">ID Persona</label>
                <input
                  type="number"
                  name="id_persona"
                  min="1"
                  defaultValue={usuario.id_persona}
                  placeholder="ID de la persona"
                  className="form-input"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconBuilding className="text-bomberos" />
              Estado y control
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">
                  Estado <span className="required">*</span>
                </label>
                <select
                  name="estado_usuario"
                  required
                  defaultValue={usuario.estado_usuario}
                  className="form-input"
                >
                  {ESTADOS_USUARIO.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">
                  ID Usuario modificador <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="updated_by"
                  min="1"
                  placeholder="ID del usuario que modifica"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconHeart className="text-bomberos" />
              Auditoría
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Creado por</label>
                <input
                  type="text"
                  disabled
                  value={usuario.created_by}
                  className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="form-label">Fecha de creación</label>
                <input
                  type="text"
                  disabled
                  value={formatearFecha(usuario.created_at)}
                  className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="form-label">Última actualización</label>
                <input
                  type="text"
                  disabled
                  value={formatearFecha(usuario.updated_at)}
                  className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/usuarios")}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button type="button" onClick={handleGuardar} className="btn-save">
              <IconSave />
              Guardar usuario
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
