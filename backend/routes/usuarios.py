from flask import Blueprint, request, g
from marshmallow import ValidationError
import traceback
from schemas.usuario_schemas import usuario_schema, usuarios_schema

from services.usuario_service import (
    obtener_todos,
    obtener_por_id,
    crear,
    crear_completo,
    crear_completo_con_roles,
    actualizar,
    eliminar
)
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

@usuarios_bp.route("", methods=["GET"])
@requires_permission("auth.usuarios.ver")
def listar_usuarios():
    try:
        usuarios = obtener_todos()
        data = usuarios_schema.dump(usuarios)
        return respuesta_api(True, data)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

@usuarios_bp.route("/<int:id>", methods=["GET"])
@requires_permission("auth.usuarios.ver")
def obtener_usuario(id):
    try:
        usuario = obtener_por_id(id)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)
        data = usuario_schema.dump(usuario)
        return respuesta_api(True, [data])
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

@usuarios_bp.route("", methods=["POST"])
@requires_permission("auth.usuarios.crear")
def crear_usuario():
    req = request.get_json()
    try:
        nuevo_usuario = crear(req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)
    return respuesta_api(True, [usuario_schema.dump(nuevo_usuario)], "Usuario creado", 201)

@usuarios_bp.route("/completo", methods=["POST"])
@requires_permission("auth.usuarios.crear")
def crear_usuario_completo():
    req = request.get_json()
    try:
        nuevo_usuario, password_temporal = crear_completo(req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)

    email = (req.get("email") or "").strip().lower()
    link_activacion = f"http://186.19.137.9:8480/activar-cuenta?email={email}"

    return respuesta_api(
        True,
        {
            "usuario": usuario_schema.dump(nuevo_usuario),
            "email": email,
            "password_temporal": password_temporal,
            "link_activacion": link_activacion,
        },
        "Usuario creado. Se envió un correo con la contraseña temporal.",
        201,
    )


# Pensado para microservicio Planes:
# recibe id_persona, email y una lista de id_roles, y crea el usuario ya
# con sus roles asignados y su credencial temporal, en una única operación. 
@usuarios_bp.route("/completo-con-roles", methods=["POST"])
@requires_permission("auth.usuarios.crear", "auth.roles.asignar", policy="ALL")
def crear_usuario_completo_con_roles():
    req = request.get_json()
    try:
        nuevo_usuario = crear_completo_con_roles(req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)

    return respuesta_api(
        True,
        {"id_usuario": nuevo_usuario.id_usuario, "estado_usuario": nuevo_usuario.estado_usuario.value},
        "Usuario creado y roles asignados",
        201,
    )

@usuarios_bp.route("/<int:id>", methods=["PUT"])
@requires_permission("auth.usuarios.editar")
def editar_usuario(id):
    usuario = obtener_por_id(id)
    if not usuario:
        return respuesta_api(False, [], "Usuario no encontrado", 404)
    try:
        actualizado = actualizar(usuario, request.get_json(), g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)
    return respuesta_api(True, [usuario_schema.dump(actualizado)], "Usuario actualizado")

@usuarios_bp.route("/<int:id>", methods=["DELETE"])
@requires_permission("auth.usuarios.eliminar")
def eliminar_usuario(id):
    try:
        usuario = obtener_por_id(id)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)
        eliminar(usuario, g.id_usuario)
        return respuesta_api(True, [], "Usuario eliminado", 200)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)