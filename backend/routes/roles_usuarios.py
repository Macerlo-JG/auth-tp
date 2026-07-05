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

"""
Este archivo define los endpoints relacionados a asignación y revocación de roles a usuarios.
"""

roles_usuarios_bp = Blueprint("roles_usuarios",__name__, url_prefix="/usuarios")

@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["GET"])
def obtener_roles(id_usuario):
    try:
        roles = obtener_roles_usuario(id_usuario)

    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 404)

    data = roles_schema.dump(roles)
    return respuesta_api(True, data)

@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["POST"])
def asignar_roles_usuario(id_usuario):
    req = request.get_json()

    try:
        asignar_roles(id_usuario, req)

    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)

    except Exception as e:
        return respuesta_api(False, [], str(e), 400)

    return respuesta_api(True, [], "Roles asignados correctamente", 201)

@roles_usuarios_bp.route("/<int:id_usuario>/roles/<int:id_rol>", methods=["DELETE"])
def revocar_rol_usuario(id_usuario, id_rol):
    req = request.get_json()

    try:
        revocar_rol(id_usuario, id_rol, req)

    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)

    return respuesta_api(True, [], "Rol revocado correctamente")


@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["DELETE"])
def revocar_roles_usuario(id_usuario):
    req = request.get_json()

    try:
        revocar_roles(id_usuario, req)

    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)

    return respuesta_api(True, [], "Roles revocados correctamente")

def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message
    }), status