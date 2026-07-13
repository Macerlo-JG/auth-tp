from flask import Blueprint, request, jsonify
import traceback
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from models.usuario import Usuario, EstadoUsuario
from services.credencial_service import verificar_password
from services import auth_service
from mocks import persona_mock_service

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        req = request.get_json()
        email = req.get("email")
        password = req.get("password")

        # Validación de presencia de datos
        if not email or not password:
            return respuesta_api(False, [], "email y password son requeridos", 400)

        # MOCK: hasta que exista Legajo, email -> id_persona se obtiene contra un mapeo hardcodeado.
        id_persona = persona_mock_service.obtener_id_persona_por_email(email)

        if id_persona is None:
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        usuario = Usuario.query.filter_by(id_persona=id_persona, activo=True).first()

        if not usuario:
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        if not verificar_password(usuario.id_usuario, password):
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        if usuario.estado_usuario != EstadoUsuario.ACTIVO:
            return respuesta_api(False, [], "El usuario no está habilitado para iniciar sesión", 401)

        access_token = create_access_token(identity=str(usuario.id_usuario))
        refresh_token = create_refresh_token(identity=str(usuario.id_usuario))

        # El jti lo genera Flask-JWT-Extended internamente al crear el token
        # Para guardarlo en la sesión hay que decodificar el token ya emitido.
        refresh_jti = decode_token(refresh_token)["jti"]

        roles, acciones = auth_service.crear_sesion_usuario(
            id_usuario=usuario.id_usuario,
            id_persona=usuario.id_persona,
            refresh_jti=refresh_jti,
        )

        return respuesta_api(True, {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "roles": roles,
            "acciones": acciones,
        }, "Login exitoso")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)
    
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        # get_jwt_identity() devuelve el "sub" del access token (el id_usuario
        # que se guardó como string en el login) - jwt_required() ya validó
        # que el token es válido y no expiró antes de llegar acá.
        id_usuario = int(get_jwt_identity())

        auth_service.cerrar_sesion_usuario(id_usuario)

        return respuesta_api(True, [], "Logout exitoso")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)
    
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        # jwt_required(refresh=True) exige específicamente un refresh token
        id_usuario = int(get_jwt_identity())
        refresh_jti = get_jwt()["jti"]

        motivo = auth_service.renovar_sesion_usuario(id_usuario, refresh_jti)

        if motivo == "no_existe":
            return respuesta_api(False, [], "No hay una sesión activa, iniciá sesión de nuevo", 401)

        if motivo == "jti_invalido":
            return respuesta_api(False, [], "Este refresh token ya no es válido, iniciá sesión de nuevo", 401)

        # Se renueva el access token.
        access_token = create_access_token(identity=str(id_usuario))

        return respuesta_api(True, {
            "access_token": access_token,
        }, "Token renovado")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message
    }), status