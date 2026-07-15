import { useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import useAuth from "../hooks/useAuth";
import {
  cambiarContrasena,
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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
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

    try {
      setLoading(true);

      const { ok, body } = await cambiarContrasena({
        id_usuario: user.id,
        password_actual: form.password_actual,
        password_nueva: form.password_nueva,
        updated_by: user.id,
      });

      if (ok) {
        toast.success(body.message || "Contraseña actualizada correctamente");
        setForm({
          password_actual: "",
          password_nueva: "",
          password_confirmacion: "",
        });
        return;
      }

      toast.error(parseApiError(body.message));
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
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
    </Layout>
  );
}
