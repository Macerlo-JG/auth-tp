import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../auth/hooks/useAuth.js";
import ActivacionModal from "../components/ActivacionModal.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showActivacion, setShowActivacion] = useState(false);
  const [emailActivacion, setEmailActivacion] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Al tocar "ingresar"
  const handleSubmit = async (e) => {
    // evito recargar
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

      // Llamo a Login (AuthContext)
      const session = await login(form.email, form.password);

      if (session.aviso_cambio_contrasena) {
        toast(
          "Recuerde cambiar su contraseña periódicamente desde el menú de usuario.",
          { icon: "ℹ️", duration: 5000 }
        );
      }

      toast.success("Bienvenido.");
      navigate("/usuarios");
    } catch (error) {
      if (error.code === "CUENTA_PENDIENTE") {
        setEmailActivacion(error.email || form.email);
        setShowActivacion(true);
        return;
      }

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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Correo electrónico</label>
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
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bomberos hover:bg-bomberos-hover disabled:bg-bomberos-dark text-white rounded-lg py-3 font-semibold transition"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Link
            to="/recuperar-contrasena"
            className="block text-sm text-bomberos hover:underline"
          >
            Recuperar contraseña
          </Link>
          <Link
            to="/activar-cuenta"
            className="block text-sm text-bomberos hover:underline"
          >
            Activar cuenta
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 border-t pt-4 space-y-4">
          <div>
            <p className="font-semibold mb-1">Administrador</p>
            <p>Email: admin@test.com</p>
            <p>Contraseña: 123456</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Alumno</p>
            <p>Email: alumno@test.com</p>
            <p>Contraseña: shiraoki123</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Docente</p>
            <p>Email: docente@test.com</p>
            <p>Contraseña: (sin credencial en seed)</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Pendiente (activar con OTP)</p>
            <p>Email: pendiente@test.com</p>
            <p>Contraseña: pendiente123</p>
          </div>
        </div>
      </div>

      <ActivacionModal
        email={emailActivacion}
        open={showActivacion}
        onClose={() => setShowActivacion(false)}
        onActivado={() => {
          toast.success("Ya puede iniciar sesión con su contraseña temporal.");
        }}
      />
    </div>
  );
}
