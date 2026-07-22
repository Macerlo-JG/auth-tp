/**
 * Modal que muestra al administrador la contraseña temporal
 * y los pasos para que el usuario active su cuenta.
 */
export default function UsuarioCreadoModal({ datos, open, onClose }) {
  if (!open || !datos) return null;

  const { email, password_temporal, link_activacion, id_usuario } = datos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Usuario creado correctamente
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Compartí estos datos con el usuario. También se simuló el envío por correo
          (revisá la consola del contenedor <strong>backend</strong> en Docker).
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-sm">
          <div>
            <span className="font-semibold text-gray-700">ID usuario:</span>{" "}
            {id_usuario}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Correo:</span>{" "}
            {email}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Contraseña temporal:</span>{" "}
            <code className="bg-white px-2 py-0.5 rounded border text-bomberos font-mono">
              {password_temporal}
            </code>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">Cómo activa el usuario su cuenta:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Recibe el mail de bienvenida con la contraseña temporal.</li>
            <li>Cuando quiera activarse, va a login y elige <strong>Activar cuenta</strong>, o usa el link del mail.</li>
            <li>Recibe un <strong>segundo mail</strong> con el código OTP.</li>
            <li>Ingresa el OTP → la cuenta pasa a ACTIVO.</li>
            <li>Ya puede iniciar sesión con su correo y contraseña temporal.</li>
          </ol>
          <p className="text-xs text-gray-400 break-all">
            Link de activación: {link_activacion}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-bomberos hover:bg-bomberos-hover text-white rounded-lg py-2.5 font-semibold"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
