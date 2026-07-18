import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import ActivacionModal from "../components/ActivacionModal.jsx";

export default function ActivarCuenta() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      setShowModal(true);
    }
  }, [emailParam]);

  const handleContinuar = () => {
    if (!email.trim()) {
      toast.error("Ingrese su correo electrónico.");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Activar cuenta
        </h1>
        <p className="text-gray-500 mb-6">
          Ingresá tu correo para recibir el código de activación.
          Podés hacerlo en cualquier momento, no hace falta justo al crear la cuenta.
        </p>
        <p className="text-xs text-gray-400 mb-4">
          También podés activar desde el login con tu contraseña temporal: al intentar
          ingresar se abrirá el mismo popup de activación.
        </p>

        <div className="space-y-4">
          <div>
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <button
            type="button"
            onClick={handleContinuar}
            className="w-full bg-bomberos hover:bg-bomberos-hover text-white rounded-lg py-3 font-semibold"
          >
            Continuar con activación
          </button>

          <Link
            to="/login"
            className="block text-center text-sm text-bomberos hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>

      <ActivacionModal
        email={email.trim().toLowerCase()}
        open={showModal}
        onClose={() => setShowModal(false)}
        onActivado={() => navigate("/login")}
      />
    </div>
  );
}
