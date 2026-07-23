import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  solicitarOtpRecuperacion,
  verificarOtpRecuperacion,
  cambiarContrasenaRecuperacion,
} from "../api/recuperacion.js";
import { parseApiError } from "../auth/utils/parse.js";

export default function RecuperarContrasena() {
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmacion, setPasswordConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSolicitarOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Ingrese su correo.");
      return;
    }

    try {
      setLoading(true);
      const { ok, body } = await solicitarOtpRecuperacion(email.trim().toLowerCase());

      if (ok) {
        toast.success(body.message);
        setPaso(2);
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Ingrese el código.");
      return;
    }

    try {
      setLoading(true);
      const { ok, body } = await verificarOtpRecuperacion({
        email: email.trim().toLowerCase(),
        otp,
      });

      if (ok) {
        toast.success(body.message);
        setPaso(3);
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();

    if (passwordNueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordNueva !== passwordConfirmacion) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      const { ok, body } = await cambiarContrasenaRecuperacion({
        email: email.trim().toLowerCase(),
        otp,
        password_nueva: passwordNueva,
      });

      if (ok) {
        toast.success(body.message || "Contraseña restablecida.");
        navigate("/login");
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarOtp = async () => {
    try {
      setLoading(true);
      const { ok, body } = await solicitarOtpRecuperacion(email.trim().toLowerCase());

      if (ok) {
        toast.success(body.message);
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Recuperar contraseña
        </h1>
        <p className="text-gray-500 mb-6">
          {paso === 1 && "Ingrese su correo. Solo se envía código si el usuario existe y está ACTIVO en la base de datos."}
          {paso === 2 && "Ingrese el código que recibió por correo (o revise la consola Docker del backend en desarrollo)."}
          {paso === 3 && "Defina su nueva contraseña."}
        </p>

        {paso === 1 && (
          <form onSubmit={handleSolicitarOtp} className="space-y-4">
            <div>
              <label className="form-label">Correo electrónico</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bomberos hover:bg-bomberos-hover disabled:opacity-60 text-white rounded-lg py-3 font-semibold"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {paso === 2 && (
          <form onSubmit={handleVerificarOtp} className="space-y-4">
            <div>
              <label className="form-label">Código de verificación</label>
              <input
                className="form-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Ej: 123456"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bomberos hover:bg-bomberos-hover disabled:opacity-60 text-white rounded-lg py-3 font-semibold"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleReenviarOtp}
              className="w-full text-bomberos hover:underline text-sm disabled:opacity-60"
            >
              Reenviar código
            </button>
          </form>
        )}

        {paso === 3 && (
          <form onSubmit={handleCambiarContrasena} className="space-y-4">
            <div>
              <label className="form-label">Nueva contraseña</label>
              <input
                className="form-input"
                type="password"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div>
              <label className="form-label">Confirmar contraseña</label>
              <input
                className="form-input"
                type="password"
                value={passwordConfirmacion}
                onChange={(e) => setPasswordConfirmacion(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bomberos hover:bg-bomberos-hover disabled:opacity-60 text-white rounded-lg py-3 font-semibold"
            >
              {loading ? "Guardando..." : "Restablecer contraseña"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="block text-center text-sm text-bomberos hover:underline mt-6"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
