from flask import Blueprint, request, g
from marshmallow import ValidationError
import traceback
from schemas.rol_schemas import rol_schema, roles_schema

from services.rol_service import (
    obtener_todos,
    obtener_por_id,
    crear,
    actualizar,
    eliminar
)
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

"""
Este archivo define los endpoints del CRUD de Rol.
"""

roles_bp = Blueprint("roles", __name__, url_prefix="/roles")

@roles_bp.route("", methods=["GET"])
@requires_permission("auth.roles.ver")
def listar_roles():
    try:
        roles = obtener_todos()
        data = roles_schema.dump(roles)
        return respuesta_api(True, data)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

@roles_bp.route("/<int:id>", methods=["GET"])
@requires_permission("auth.roles.ver")
def obtener_rol(id):
    try:
        rol = obtener_por_id(id)

        if not rol:
            return respuesta_api(False, [], "Rol no encontrado", 404)

        data = rol_schema.dump(rol)
        return respuesta_api(True, [data])
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

@roles_bp.route("", methods=["POST"])
@requires_permission("auth.roles.control_parcial")
def crear_rol():
    req = request.get_json()

    try:
        nuevo_rol = crear(req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)

    return respuesta_api(True, [rol_schema.dump(nuevo_rol)], "Rol creado", 201)

@roles_bp.route("/<int:id>", methods=["PUT"])
@requires_permission("auth.roles.control_parcial")
def editar_rol(id):
    rol = obtener_por_id(id)

    if not rol:
        return respuesta_api(False, [], "Rol no encontrado", 404)

    try:
        actualizado = actualizar(rol, request.get_json(), g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)

    return respuesta_api(True, [rol_schema.dump(actualizado)], "Rol actualizado")

@roles_bp.route("/<int:id>", methods=["DELETE"])
@requires_permission("auth.roles.eliminar")
def eliminar_rol(id):
    try:
        rol = obtener_por_id(id)

        if not rol:
            return respuesta_api(False, [], "Rol no encontrado", 404)

        eliminar(rol, g.id_usuario)

        return respuesta_api(True, [], "Rol eliminado", 200)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)