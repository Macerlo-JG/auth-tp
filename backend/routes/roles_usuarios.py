from flask import Blueprint, request, g
from marshmallow import ValidationError
import traceback
from services.rol_usuario_service import (
    obtener_roles_usuario,
    asignar_roles,
    revocar_rol,
    revocar_roles
)
from schemas.rol_schemas import roles_schema
from models.rol import Rol
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

"""
Este archivo define los endpoints relacionados a asignación y revocación de roles a usuarios.
"""

# Blueprint = módulo de rutas montado bajo el prefijo /usuarios.
roles_usuarios_bp = Blueprint("roles_usuarios", __name__, url_prefix="/usuarios")


# Traer todos los roles disponibles y activos
@roles_usuarios_bp.route("/roles", methods=["GET"])
@requires_permission("auth.usuarios.ver", "auth.roles.asignar", policy="ANY")
def listar_roles():
    try:
        roles = Rol.query.filter_by(activo=True).all()
        # .dump prepara los datos para convertir a json.
        data = roles_schema.dump(roles)

        # retorno exito y data serializada.
        return respuesta_api(True, data)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

# va a la capa "servicio" y valida que el usuario exista. 
# se obtienen roles del usuario.
@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["GET"])
@requires_permission("auth.usuarios.ver", "auth.roles.asignar", policy="ANY")
def obtener_roles(id_usuario):
    try:
        roles = obtener_roles_usuario(id_usuario)
    except ValidationError as e:
        # si no hay nada, 404 (no encontrado), retorna error
        return respuesta_api(False, [], e.messages, 404)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

    data = roles_schema.dump(roles)
    return respuesta_api(True, data)

@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["POST"])
@requires_permission("auth.roles.asignar")
def asignar_roles_usuario(id_usuario):
    req = request.get_json()

    try:
        # La validación de forma y reglas de negocio ocurre en el service.
        asignar_roles(id_usuario, req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

    return respuesta_api(True, [], "Roles asignados correctamente", 201)

# Revoca rol puntual
@roles_usuarios_bp.route("/<int:id_usuario>/roles/<int:id_rol>", methods=["DELETE"])
@requires_permission("auth.roles.asignar")
def revocar_rol_usuario(id_usuario, id_rol):
    try:
        revocar_rol(id_usuario, id_rol, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

    return respuesta_api(True, [], "Rol revocado correctamente")


# Revoca varios roles a la vez, se espera dentro de request (definido por el service).
@roles_usuarios_bp.route("/<int:id_usuario>/roles", methods=["DELETE"])
@requires_permission("auth.roles.asignar")
def revocar_roles_usuario(id_usuario):
    req = request.get_json()

    try:
        revocar_roles(id_usuario, req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

    return respuesta_api(True, [], "Roles revocados correctamente")