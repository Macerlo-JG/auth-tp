"""Rutas para manejar contraseñas y credenciales.

Este módulo expone endpoints para:
    - verificar que una contraseña actual sea válida,
    - solicitar un OTP previo al cambio de contraseña (usuario logueado),
    - cambiar la contraseña de un usuario (ahora exige OTP válido),
    - generar una contraseña temporal (por ejemplo, al crear un usuario nuevo).
"""
from flask import Blueprint, request, g
import traceback
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.credencial_service import (
    verificar_password,
    cambiar_password,
    crear_password_temporal,
)
from services.usuario_service import obtener_por_id
from services.otp_service import generar_otp, verificar_otp
from services.email_service import enviar_otp_cambio_contrasena
from services.cliente_planes import obtener_email_por_id_persona
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission
from db import limiter

credenciales_bp = Blueprint("credenciales", __name__, url_prefix="/auth/credenciales")

# Tipo de OTP propio para este flujo -- namespace separado en Redis del
# de "recuperacion" y "activacion", así un código de uno no sirve para otro.
TIPO_OTP_CAMBIO = "cambio_contrasena"

def clave_por_usuario_jwt():
    """Rate limit por identidad del JWT ya validado (no por IP)."""
    return get_jwt_identity()


@credenciales_bp.route("/verificar", methods=["POST"])
@jwt_required()
@limiter.limit("10/minute", key_func=clave_por_usuario_jwt)
def verificar_credencial():
    """
    Verifica la contraseña del usuario AUTENTICADO. Ya no acepta un
    id_usuario arbitrario en el body: se usa la identidad del token para
    que un usuario no pueda sondear la contraseña de otra cuenta.
    """
    try:        # Solo se valida la existencia del usuario y la contraseña ingresada.
        req = request.get_json() or {}
        password = req.get("password")

        if not password:
            return respuesta_api(False, [], "password es requerido", 400)
        # Lógica de negocio delegada al servicio de credenciales.
        id_usuario = int(get_jwt_identity())
        coincide = verificar_password(id_usuario, password)

        if not coincide:
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        return respuesta_api(True, [], "Credenciales válidas")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@credenciales_bp.route("/cambiar/solicitar-otp", methods=["POST"])
@jwt_required()
@limiter.limit("5/minute", key_func=clave_por_usuario_jwt)
def solicitar_otp_cambio():
    """Genera y envía el OTP que habilita el cambio de contraseña.

    Protegido por JWT: se usa la identidad del token, no un id_usuario que
    venga en el body, para no permitir que alguien pida un OTP para la
    cuenta de otra persona.

    Exige 'password_actual' en el body y la valida antes de generar y
    enviar el OTP.
    """
    try:
        id_usuario = int(get_jwt_identity())

        req = request.get_json() or {}
        password_actual = req.get("password_actual")

        if not password_actual:
            return respuesta_api(False, [], "password_actual es requerido", 400)

        if not verificar_password(id_usuario, password_actual):
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        usuario = obtener_por_id(id_usuario)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)

        # email -> id_persona se resuelve contra Planes (GET /contactos/GetPersonaIDFromMail)
        email = obtener_email_por_id_persona(usuario.id_persona)

        if not email:
            return respuesta_api(
                False, [], "No hay un correo asociado a este usuario", 400
            )

        codigo = generar_otp(TIPO_OTP_CAMBIO, email)
        enviar_otp_cambio_contrasena(email, codigo)

        return respuesta_api(True, [], "Se envió un código a su correo para confirmar el cambio.")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@credenciales_bp.route("/cambiar", methods=["POST"])
@jwt_required()
@limiter.limit("5/minute", key_func=clave_por_usuario_jwt)
def cambiar_credencial():
    try:
        id_usuario_token = int(get_jwt_identity())
        req = request.get_json() or {}
        password_actual = req.get("password_actual")
        password_nueva = req.get("password_nueva")
        otp = req.get("otp")

        if not password_actual or not password_nueva or not otp:
            return respuesta_api(
                False, [], "password_actual, password_nueva y otp son requeridos", 400,
            )

        usuario = obtener_por_id(id_usuario_token)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)

        # email -> id_persona se resuelve contra Planes (GET /contactos/GetPersonaIDFromMail)
        email = obtener_email_por_id_persona(usuario.id_persona)
        

        if not email:
            return respuesta_api(
                False, [], "No hay un correo asociado a este usuario", 400
            )

        # Acá SÍ se consume el OTP (consumir=True por default): este es el
        # paso que efectivamente aplica el cambio.
        if not verificar_otp(TIPO_OTP_CAMBIO, email, otp):
            return respuesta_api(False, [], "Código inválido o expirado.", 400)

        cambiar_password(id_usuario_token, password_actual, password_nueva, id_usuario_token)
        return respuesta_api(True, [], "Contraseña actualizada correctamente")

    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@credenciales_bp.route("/temporal", methods=["POST"])
@requires_permission("auth.credenciales.temporal")
@limiter.limit("20/minute", key_func=clave_por_usuario_jwt)
def crear_credencial_temporal():
    """
    Genera una contraseña temporal para id_usuario. Requiere el permiso
    administrativo auth.credenciales.temporal — no es de acceso libre
    para cualquier usuario autenticado. created_by se toma de flask.g
    (seteado por validar_sesion / requires_permission), no del body,
    para no permitir suplantar la autoría de la acción.
    """
    try:
        req = request.get_json() or {}
        id_usuario = req.get("id_usuario")

        if not id_usuario:
            return respuesta_api(False, [], "id_usuario es requerido", 400)

        usuario = obtener_por_id(id_usuario)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)

        created_by = g.id_usuario
        password_temporal = crear_password_temporal(id_usuario, created_by)

        # crear_password_temporal no comitea (ver credencial_service.py);
        # como este endpoint la usa standalone, el commit es su responsabilidad.
        from db import db
        db.session.commit()

        return respuesta_api(
            True,
            {"password_temporal": password_temporal},
            "Contraseña temporal generada",
            201,
        )

    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)