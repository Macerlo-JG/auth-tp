// Pantalla para que un usuario logueado cambie su contraseña actual.
import { useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import ConfirmarOtpModal from "../components/ConfirmarOtpModal.jsx";
import useAuth from "../hooks/useAuth";
import {
  cambiarContrasena,
  solicitarOtpCambioContrasena, // TODO: agregar en api/credenciales.js
  parseApiError,
} from "../api/credenciales.js";

export default function CambiarContrasena() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    password_actual: "",
    password_nueva: "",
    password_confirmacion: "",
  });

  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Antes: este submit llamaba directo a cambiarContrasena.
  // Ahora solo valida el formulario y abre el popup de OTP; el cambio
  // real se dispara desde handleConfirmarOtp una vez que el código es
  // válido (ver ConfirmarOtpModal, que llama a onSolicitarOtp al abrirse).
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.password_actual.trim()) {
      toast.error("Ingrese su contraseña actual.");
      return;
    }

    if (!form.password_nueva.trim()) {
      toast.error("Ingrese la nueva contraseña.");
      return;
    }

    if (form.password_nueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password_nueva !== form.password_confirmacion) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }

    setShowOtpModal(true);
  };

  const handleConfirmarOtp = async (otp) => {
    setLoading(true);
    try {
      // El backend valida el OTP y recién ahí aplica cambiar_password.
      // id_usuario ya no se manda en el body: el backend lo toma del JWT
      // (endpoint protegido con @jwt_required), así nadie puede pedir un
      // cambio de contraseña para otro id_usuario editando el payload.
      const { ok, body } = await cambiarContrasena({
        password_actual: form.password_actual,
        password_nueva: form.password_nueva,
        otp,
      });

      if (ok) {
        setForm({
          password_actual: "",
          password_nueva: "",
          password_confirmacion: "",
        });
      } else {
        toast.error(parseApiError(body.message));
      }

      return { ok, body };
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Usuarios", to: "/usuarios" },
          { label: "Cambiar contraseña" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Cambiar contraseña
        </h1>
        <p className="text-gray-500 mt-1">
          Actualice su contraseña de acceso al sistema.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">
              Contraseña actual <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="password"
              name="password_actual"
              placeholder="Ingrese su contraseña actual"
              value={form.password_actual}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label className="form-label">
              Nueva contraseña <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="password"
              name="password_nueva"
              placeholder="Mínimo 6 caracteres"
              value={form.password_nueva}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="form-label">
              Confirmar nueva contraseña <span className="required">*</span>
            </label>
            <input
              className="form-input"
              type="password"
              name="password_confirmacion"
              placeholder="Repita la nueva contraseña"
              value={form.password_confirmacion}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="btn-save disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmarOtpModal
        open={showOtpModal}
        titulo="Confirmar cambio de contraseña"
        descripcion="Por seguridad, ingrese el código que le enviamos a su correo para confirmar el cambio."
        onSolicitarOtp={solicitarOtpCambioContrasena}
        onConfirmar={handleConfirmarOtp}
        onClose={() => setShowOtpModal(false)}
      />
    </Layout>
  );
}