from flask import Blueprint, request, g
from marshmallow import ValidationError
import traceback
from schemas.usuario_schemas import usuario_schema, usuarios_schema

from services.usuario_service import (
    obtener_todos,
    obtener_por_id,
    crear,
    crear_completo,
    actualizar,
    eliminar
)
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

"""
Este archivo define los endpoints del CRUD de usuario
"""

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
@requires_permission("auth.usuarios.control_parcial")
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

# En esta función se crea el usuario y se envía el correo con la contraseña temporal.
@usuarios_bp.route("/completo", methods=["POST"])
@requires_permission("auth.usuarios.control_parcial")
def crear_usuario_completo():
    req = request.get_json()

    try:
        # Almaceno los 2 return.
        nuevo_usuario, password_temporal = crear_completo(req, g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 400)

    email = (req.get("email") or "").strip().lower()
    link_activacion = f"http://localhost:5173/activar-cuenta?email={email}"
    # devuelvo link de activación pasando de
    # parametro el mail para que el usuario pueda ir desde el
    # mail a su página de activación correspondiente para mayor comodidad y experencia de usuario

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
    
@usuarios_bp.route("/<int:id>", methods=["PUT"])   
@requires_permission("auth.usuarios.control_parcial")
def editar_usuario(id):    
    usuario = obtener_por_id(id)

    if not usuario:
        return respuesta_api(False, [], "Usuario no encontrado", 404)

    try:
        actualizado = actualizar(usuario, request.get_json(), g.id_usuario)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
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