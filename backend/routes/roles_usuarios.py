from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from services.rol_usuario_service import (
    obtener_roles_usuario,
    asignar_roles,
    revocar_rol,
    revocar_roles
)
from schemas.rol_usuario_schemas import roles_usuarios_schema, roles_usuario_schema
from schemas.rol_schemas import roles_schema
from models.rol import Rol

"""
Este archivo define los endpoints relacionados a asignación y revocación de roles a usuarios.
"""

# Blueprint = módulo de rutas montado bajo el prefijo /usuarios.
roles_usuarios_bp = Blueprint("roles_usuarios", __name__, url_prefix="/usuarios")


# Traer todos los roles disponibles y activos
@roles_usuarios_bp.route("/roles", methods=["GET"])
def listar_roles():
    roles = Rol.query.filter_by(activo=True).all()
    # .dump prepara los datos para convertir a json.
    data = roles_schema.dump(roles)

    # retorno exito y data serializada.
    return respuesta_api(True, data)

# va a la capa "servicio" y valida que el usuario exista. 
# se obtienen roles del usuario.
@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["GET"])
def obtener_roles(id_usuario):
    try:
        roles = obtener_roles_usuario(id_usuario)
    except ValidationError as e:
        # si no hay nada, 404 (no encontrado), retorna error
        return respuesta_api(False, [], e.messages, 404)

    data = roles_schema.dump(roles)
    return respuesta_api(True, data)

@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["POST"])
def asignar_roles_usuario(id_usuario):
    req = request.get_json()

    try:
        # request trae  json { "id_roles": [...], "created_by": ... }.
        # La validación de forma y reglas de negocio ocurre en el service.
        asignar_roles(id_usuario, req)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as e:
        # Catch genérico: útil como red de contención, pero  no es útil para un usuario.
        return respuesta_api(False, [], str(e), 400)

    return respuesta_api(True, [], "Roles asignados correctamente", 201)

# Revoca rol puntual
@roles_usuarios_bp.route("/<int:id_usuario>/roles/<int:id_rol>", methods=["DELETE"])
def revocar_rol_usuario(id_usuario, id_rol):
    req = request.get_json()

    try:
        revocar_rol(id_usuario, id_rol, req)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)

    return respuesta_api(True, [], "Rol revocado correctamente")


# Revoca varios roles a la vez, se espera dentro de request (definido por el service).
@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["DELETE"])
def revocar_roles_usuario(id_usuario):
    req = request.get_json()

    try:
        revocar_roles(id_usuario, req)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)

    return respuesta_api(True, [], "Roles revocados correctamente")

    # normalización de respuesta entre todos los endpoints
def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message
    }), status