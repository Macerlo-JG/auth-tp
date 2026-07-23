import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import UsuarioCreadoModal from "../components/UsuarioCreadoModal.jsx";
import useAuth from "../auth/hooks/useAuth.js";

import {
  IconPerson,
  IconBuilding,
  IconHeart,
  IconSave,
} from "../components/icons.jsx";

import {
  crearUsuarioCompleto,
} from "../api/usuarios.js";
import { parseApiError } from "../auth/utils/parseApiError.js";


export default function NuevoUsuario() {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [datosCreados, setDatosCreados] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGuardar = async () => {
    const form = formRef.current;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));

    const jsonData = {
      id_persona: parseInt(data.id_persona, 10),
      email: data.email.trim(),
    };

    try {
      const { ok, body } = await crearUsuarioCompleto(jsonData);

      if (ok) {
        const info = body.data || {};
        setDatosCreados({
          id_usuario: info.usuario?.id_usuario,
          email: info.email,
          password_temporal: info.password_temporal,
          link_activacion: info.link_activacion,
        });
        setShowModal(true);
        toast.success(body.message || "Usuario creado");
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    navigate("/usuarios");
  };

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Usuarios", to: "/usuarios" },
          { label: "Nuevo" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Nuevo Usuario
        </h1>
        <p className="text-gray-500 mt-1">
          Complete la información del nuevo usuario del sistema.
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
                <label className="form-label">
                  ID Persona <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="id_persona"
                  min="1"
                  placeholder="Ingrese el ID de la persona"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">
                  Correo electrónico <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="usuario@ejemplo.com"
                  className="form-input"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Se enviará la contraseña temporal a este correo (simulado en consola del backend).
                </p>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconBuilding className="text-bomberos" />
              Datos de registro
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">
                  ID Usuario Creador
                </label>
                <input
                  type="number"
                  name="created_by"
                  value={user?.id || 1}
                  readOnly
                  className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="form-label">
                  Estado inicial
                </label>
                <input
                  type="text"
                  value="PENDIENTE"
                  disabled
                  className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconHeart className="text-bomberos" />
              Información del sistema
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="form-label">
                  Notas
                </label>
                <input
                  type="text"
                  disabled
                  value="Tras crear, verás la contraseña temporal en pantalla. El OTP de activación se envía cuando el usuario lo solicite."
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
            <button
              type="button"
              onClick={handleGuardar}
              className="btn-save"
            >
              <IconSave />
              Crear usuario
            </button>
          </div>
        </form>
      </div>

      <UsuarioCreadoModal
        datos={datosCreados}
        open={showModal}
        onClose={handleCerrarModal}
      />
    </Layout>
  );
}
