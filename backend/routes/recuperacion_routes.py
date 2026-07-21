"""Rutas para el flujo de recuperación de contraseña mediante OTP."""
from flask import Blueprint, request, jsonify
import traceback

from mock.emails_usuario import obtener_id_persona_por_email
from models.usuario import EstadoUsuario
from services.usuario_service import obtener_por_id_persona
from services.otp_service import generar_otp, verificar_otp
from services.email_service import enviar_otp_recuperacion
from services.credencial_service import restablecer_password

recuperacion_bp = Blueprint("recuperacion", __name__, url_prefix="/recuperacion")


def _usuario_activo_por_email(email):
    """Verificamos que el usuario exista y esté ACTIVO.
    Se usa antes de enviar el OTP para no filtrar usuarios inactivos o pendientes.
    """
    id_persona = obtener_id_persona_por_email(email)
    if not id_persona:
        return None

    usuario = obtener_por_id_persona(id_persona)
    if not usuario or usuario.estado_usuario != EstadoUsuario.ACTIVO:
        return None

    return usuario


@recuperacion_bp.route("/solicitar-otp", methods=["POST"])
def solicitar_otp():
    try:
        req = request.get_json() or {}
        email = (req.get("email") or "").strip().lower()

        if not email:
            return respuesta_api(False, [], "email es requerido", 400)

        usuario = _usuario_activo_por_email(email)
        if usuario:
            codigo = generar_otp("recuperacion", email)
            enviar_otp_recuperacion(email, codigo)
        else:
            # No indicamos al cliente si el email existe.
            print(
                f"[recuperacion] No se envió mail: usuario inexistente o no activo ({email})",
                flush=True,
            )

        return respuesta_api(
            True,
            [],
            "Si el correo existe y la cuenta está activa, recibirá un código de recuperación.",
        )

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@recuperacion_bp.route("/verificar-otp", methods=["POST"])
def verificar_otp_endpoint():
    try:
        req = request.get_json() or {}
        email = (req.get("email") or "").strip().lower()
        otp = req.get("otp")

        if not email or not otp:
            return respuesta_api(False, [], "email y otp son requeridos", 400)

        # consumir=False: este paso solo habilita el formulario de nueva
        # contraseña, no gasta el código. El OTP se consume de verdad en
        # /recuperacion/cambiar (ver ese endpoint).
        if not verificar_otp("recuperacion", email, otp, consumir=False):
            return respuesta_api(False, [], "Código inválido o expirado.", 400)

        return respuesta_api(True, [], "Código verificado. Puede ingresar su nueva contraseña.")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@recuperacion_bp.route("/cambiar", methods=["POST"])
def cambiar_contrasena():
    try:
        req = request.get_json() or {}
        email = (req.get("email") or "").strip().lower()
        otp = req.get("otp")
        password_nueva = req.get("password_nueva")

        if not email or not otp or not password_nueva:
            return respuesta_api(
                False,
                [],
                "email, otp y password_nueva son requeridos",
                400,
            )

        id_persona = obtener_id_persona_por_email(email)
        if not id_persona:
            return respuesta_api(False, [], "Código inválido.", 400)

        usuario = obtener_por_id_persona(id_persona)
        if not usuario or usuario.estado_usuario != EstadoUsuario.ACTIVO:
            return respuesta_api(False, [], "La cuenta no puede recuperarse.", 400)

        if not verificar_otp("recuperacion", email, otp):
            return respuesta_api(False, [], "Código inválido o expirado.", 400)

        # verificar_otp ya borró el OTP de Redis al validarlo con éxito
        # (ver otp_service.py) -- no hace falta llamar eliminar_otp acá.
        restablecer_password(usuario.id_usuario, password_nueva, usuario.id_usuario)

        return respuesta_api(True, [], "Contraseña restablecida correctamente.")

    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
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