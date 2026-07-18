
from flask import Blueprint, request, jsonify
import traceback

from mock.emails_usuario import obtener_id_usuario_por_email
from models.usuario import EstadoUsuario
from services.usuario_service import obtener_por_id, activar_cuenta
from services.otp_service import generar_otp, verificar_otp, eliminar_otp
from services.email_service import enviar_otp_activacion

activacion_bp = Blueprint("activacion", __name__, url_prefix="/activacion")

"""
Rutas para la activación de cuentas mediante OTP.

El mismo servicio de OTP buscar ser flexible para extenderse a otros flujos 
ej: recuperación de contraseña o edición de datos sensibles como mail de inicio de sesión.
"""

# solicito un código de activación
@activacion_bp.route("/solicitar-otp", methods=["POST"])
def solicitar_otp():
    try:
        req = request.get_json() or {}
        email = (req.get("email") or "").strip().lower()

        if not email:
            return respuesta_api(False, [], "email es requerido", 400)

        id_usuario = obtener_id_usuario_por_email(email)
        if not id_usuario:
            # No revelamos si el correo existe para evitar enumeración de usuarios.
            return respuesta_api(True, [], "Si el correo existe, recibirá un código de activación.")

        usuario = obtener_por_id(id_usuario)
        if not usuario:
            return respuesta_api(True, [], "Si el correo existe, recibirá un código de activación.")

        if usuario.estado_usuario == EstadoUsuario.ACTIVO:
            return respuesta_api(False, [], "La cuenta ya está activa.", 400)

        if usuario.estado_usuario != EstadoUsuario.PENDIENTE:
            return respuesta_api(False, [], "La cuenta no puede activarse.", 400)

        # Genera el OTP usando el servicio compartido de OTP.
        codigo = generar_otp("activacion", email)
        enviar_otp_activacion(email, codigo)

        return respuesta_api(True, [], "Se envió un código de activación a su correo.")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


# Verificar el OTP ingresado
@activacion_bp.route("/verificar", methods=["POST"])
def verificar():
    try:
        req = request.get_json() or {}
        email = (req.get("email") or "").strip().lower()
        otp = req.get("otp")

        if not email or not otp:
            return respuesta_api(False, [], "email y otp son requeridos", 400)

        id_usuario = obtener_id_usuario_por_email(email)
        if not id_usuario:
            return respuesta_api(False, [], "Código inválido.", 400)


        usuario = obtener_por_id(id_usuario)
        if not usuario or usuario.estado_usuario != EstadoUsuario.PENDIENTE:
            return respuesta_api(False, [], "La cuenta no puede activarse.", 400)

        if not verificar_otp("activacion", email, otp):
            return respuesta_api(False, [], "Código inválido o expirado.", 400)

        eliminar_otp("activacion", email)
        activar_cuenta(usuario)

        return respuesta_api(True, [], "Cuenta activada correctamente. Ya puede iniciar sesión.")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message,
    }), status
