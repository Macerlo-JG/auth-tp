import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Popup genérico para confirmar una acción sensible con OTP.
 * Recibo funciones de solicitar/confirmar como
 * props, para poder reutilizarlo en cualquier flujo (cambio de
 * contraseña, edición de email, etc.) sin acoplarlo a un endpoint fijo.
 * onSolicitarOtp: dispara el envío del OTP
 * onConfirmar: valida el OTP y ejecuta la acción real (ej: el cambio de contraseña)
 */
export default function ConfirmarOtpModal({
  open,
  titulo = "Confirmar acción",
  descripcion = "Ingrese el código que le enviamos por correo para confirmar.",
  onSolicitarOtp,
  onConfirmar,
  onClose,
  onConfirmado,
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpEnviado, setOtpEnviado] = useState(false);

  useEffect(() => {
    if (open) {
      setOtp("");
      setOtpEnviado(false);
      enviarOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const enviarOtp = async () => {
    if (!onSolicitarOtp) return;
    try {
      setLoading(true);
      const { ok, body } = await onSolicitarOtp();
      if (ok) {
        setOtpEnviado(true);
        toast.success(body?.message || "Código enviado a su correo.");
      } else {
        toast.error(body?.message || "No se pudo enviar el código.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Ingrese el código.");
      return;
    }

    try {
      setLoading(true);
      const { ok, body } = await onConfirmar(otp.trim());

      if (ok) {
        toast.success(body?.message || "Confirmado.");
        onConfirmado?.();
        onClose?.();
      } else {
        toast.error(body?.message || "Código inválido o expirado.");
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">{titulo}</h2>
        <p className="text-gray-500 text-sm mb-4">{descripcion}</p>

        <form onSubmit={handleConfirmar} className="space-y-4">
          <div>
            <label className="form-label">Código de confirmación</label>
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
              {loading ? "Confirmando..." : "Confirmar"}
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
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}