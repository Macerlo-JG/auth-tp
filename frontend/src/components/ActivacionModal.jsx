import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  solicitarOtpActivacion,
  verificarActivacion,
  parseApiError,
} from "../api/activacion.js";

/**
 * Popup reutilizable para activar una cuenta con OTP.
 * Se usa desde el login y desde /activar-cuenta.
 */
export default function ActivacionModal({ email, open, onClose, onActivado }) {
  // variable + función para cambiar lo que esta adentro de la funcion.
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpEnviado, setOtpEnviado] = useState(false);

  // Automaticamente pido OTP.
  useEffect(() => {
    if (open && email) {
      setOtp("");
      setOtpEnviado(false);
      enviarOtp();
    }
  }, [open, email]);
  // escucho cambios y parametros


  // voy al back end
  const enviarOtp = async () => {
    if (!email) return;

    try {
      setLoading(true);
      const { ok, body } = await solicitarOtpActivacion(email);

      if (ok) {
        setOtpEnviado(true);
        toast.success(body.message || "Código enviado a su correo.");
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

  const handleVerificar = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Ingrese el código de activación.");
      return;
    }

    try {
      setLoading(true);
      const { ok, body } = await verificarActivacion({ email, otp });

      if (ok) {
        toast.success(body.message || "Cuenta activada.");
        onActivado?.();
        onClose?.();
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Activar cuenta
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Su cuenta aún no fue confirmada. Revise su correo e ingrese el código
          de activación que le enviamos a <strong>{email}</strong>.
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded p-2 mb-4">
          En desarrollo, el código aparece en la consola Docker del contenedor{" "}
          <strong>backend</strong>. Para pruebas rápidas puede usar:{" "}
          <code>temporal</code>
        </p>

        <form onSubmit={handleVerificar} className="space-y-4">
          <div>
            <label className="form-label">Código de activación</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ej: 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bomberos hover:bg-bomberos-hover disabled:opacity-60 text-white rounded-lg py-2.5 font-semibold"
            >
              {loading ? "Verificando..." : "Activar cuenta"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={enviarOtp}
              className="w-full text-bomberos hover:underline text-sm disabled:opacity-60"
            >
              {otpEnviado ? "Reenviar código" : "Enviar código"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
