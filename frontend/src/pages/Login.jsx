import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("Ingrese un correo.");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Ingrese una contraseña.");
      return;
    }

    try {
      setLoading(true);

      await login(form.email, form.password);

      toast.success("Bienvenido.");

      navigate("/usuarios");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Iniciar sesión
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Sistema de Gestión Académica
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="form-label">
              Correo electrónico
            </label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="admin@test.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>

            <label className="form-label">
              Contraseña
            </label>

            <div className="relative">
              <input
                className="form-input pr-12"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bomberos hover:bg-bomberos-hover disabled:bg-bomberos-dark text-white rounded-lg py-3 font-semibold transition"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-500 border-t pt-4">
          <p className="font-semibold mb-2">
            Usuario de prueba
          </p>
          <p>Email: admin@test.com</p>
          <p>Contraseña: 123456</p>
        </div>
                <div className="mt-8 text-sm text-gray-500 border-t pt-4">
          <p className="font-semibold mb-2">
            Usuario de prueba
          </p>
          <p>Email: operador@test.com</p>
          <p>Contraseña: 123456</p>
        </div>
                <div className="mt-8 text-sm text-gray-500 border-t pt-4">
          <p className="font-semibold mb-2">
            Usuario de prueba
          </p>
          <p>Email: consultor@test.com</p>
          <p>Contraseña: 123456</p>
        </div>

      </div>

    </div>
  );
}