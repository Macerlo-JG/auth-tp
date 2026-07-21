"""
Blueprint de autenticación.

Endpoints:
  POST /auth/login    — valida credenciales y abre sesión.
  POST /auth/logout   — cierra sesión (invalida el refresh token en Redis).
  POST /auth/refresh  — emite un nuevo access token si el refresh token es válido.
"""

import traceback
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from mocks import persona_mock_service
from services.auth_service import (
    login,
    crear_sesion_usuario,
    cerrar_sesion_usuario,
    renovar_sesion_usuario,
    CuentaPendienteError,
    verificar_aviso_cambio_contrasena,
)
from auth_common.respuesta_api import respuesta_api
from db import limiter

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ---------------------------------------------------------------------------
# Funciones de clave para rate limiting
# ---------------------------------------------------------------------------

def clave_por_email():
    """Segunda clave de rate limit para /login: por email en lugar de IP."""
    body = request.get_json(silent=True) or {}
    return body.get("email") or request.remote_addr


def clave_por_usuario_refresh():
    """
    Clave de rate limit para /refresh: por id_usuario.
    Solo se llama después de que @jwt_required(refresh=True) ya corrió,
    así que get_jwt_identity() está disponible.
    """
    return get_jwt_identity()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5/minute")
@limiter.limit("10/minute", key_func=clave_por_email)
def iniciar_sesion():
    try:
        req = request.get_json() or {}
        email = req.get("email", "").strip().lower()
        password = req.get("password")

        if not email or not password:
            return respuesta_api(False, [], "email y password son requeridos", 400)

        # MOCK: hasta que exista el servicio de Legajo, email → id_persona
        # se resuelve contra un mapeo hardcodeado.
        id_persona = persona_mock_service.obtener_id_persona_por_email(email)

        if id_persona is None:
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        # Valida estado y contraseña; lanza ValueError o CuentaPendienteError.
        usuario = login(id_persona, password)

        access_token = create_access_token(identity=str(usuario.id_usuario))
        refresh_token = create_refresh_token(identity=str(usuario.id_usuario))
        refresh_jti = decode_token(refresh_token)["jti"]

        roles, acciones = crear_sesion_usuario(
            id_usuario=usuario.id_usuario,
            id_persona=usuario.id_persona,
            refresh_jti=refresh_jti,
        )
        
        # si pasaron 30 dias desde que el usuario no cambio su contraseña, se avisa.
        aviso_cambio_contrasena = verificar_aviso_cambio_contrasena(usuario.id_usuario)

        return respuesta_api(True, {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "roles": roles,
            "acciones": acciones,
            "user": {
                "id": usuario.id_usuario,
                # "email": usuario.email,
            },
            "permisos": acciones,
            "aviso_cambio_contrasena": aviso_cambio_contrasena,
        }, "Inicio de sesión exitoso")

    except CuentaPendienteError as error:
        # El frontend usa este code para redirigir al flujo de activación.
        return jsonify({
            "ok": False,
            "code": "CUENTA_PENDIENTE",
            "data": {
                "id_usuario": error.id_usuario,
                "email": error.email,
            },
            "message": str(error),
        }), 403

    except ValueError as error:
        return respuesta_api(False, [], str(error), 401)

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def cerrar_sesion():
    try:
        id_usuario = int(get_jwt_identity())
        cerrar_sesion_usuario(id_usuario)
        return respuesta_api(True, [], "Sesión cerrada")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@auth_bp.route("/refresh", methods=["POST"])
@limiter.limit("5/minute")
@jwt_required(refresh=True)
@limiter.limit("10/minute", key_func=clave_por_usuario_refresh)
def renovar_token():
    try:
        id_usuario = int(get_jwt_identity())
        refresh_jti = get_jwt()["jti"]

        motivo = renovar_sesion_usuario(id_usuario, refresh_jti)

        if motivo == "no_existe":
            return respuesta_api(False, [], "No hay una sesión activa, iniciá sesión de nuevo", 401)

        if motivo == "jti_invalido":
            return respuesta_api(False, [], "Este refresh token ya no es válido, iniciá sesión de nuevo", 401)

        access_token = create_access_token(identity=str(id_usuario))

        return respuesta_api(True, {
            "access_token": access_token,
        }, "Token renovado")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)