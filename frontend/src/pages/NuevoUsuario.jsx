import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import {
  IconPerson,
  IconBuilding,
  IconHeart,
  IconSave,
} from "../components/icons.jsx";
import { crearUsuario, parseApiError } from "../api/usuarios.js";

export default function NuevoUsuario() {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleGuardar = async () => {
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const jsonData = {
      id_persona: parseInt(data.id_persona, 10),
      created_by: parseInt(data.created_by, 10),
    };

    try {
      const { ok, body } = await crearUsuario(jsonData);
      if (ok) {
        toast.success(body.message || "Usuario creado");
        navigate("/usuarios");
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Nuevo Usuario</h1>
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
                  ID Usuario creador <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="created_by"
                  min="1"
                  placeholder="ID del usuario que crea el registro"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Estado inicial</label>
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
                <label className="form-label">Notas</label>
                <input
                  type="text"
                  disabled
                  value="El estado se asigna automáticamente como PENDIENTE al crear el usuario."
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
