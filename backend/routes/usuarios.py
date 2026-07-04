from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from schemas.usuario_schema import usuario_schema, usuarios_schema

from services.usuario_service import (
    obtener_todos,
    obtener_por_id,
    crear,
    actualizar,
    eliminar
)

"""
Este archivo define los endpoints del CRUD de usuario

Utiliza Flask Blueprint para modularizar las rutas y separarlas del archivo principal
Cada endpoint llama a la capa de servicios, donde está la lógica de negocio
"""

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

@usuarios_bp.route("", methods=["GET"])
def listar_usuarios():
    usuarios = obtener_todos()
    data = usuarios_schema.dump(usuarios)

    return respuesta_api(True, data)

@usuarios_bp.route("/<int:id>", methods=["GET"])
def obtener_usuario(id):
    usuario = obtener_por_id(id)

    if not usuario:
        return respuesta_api(False, [], "Usuario no encontrado", 404)

    data = usuario_schema.dump(usuario)
    return respuesta_api(True, [data])

@usuarios_bp.route("", methods=["POST"])
def crear_usuario():
    req = request.get_json()

    try:
        nuevo_usuario = crear(req)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as e:
        return respuesta_api(False, [], str(e), 400)

    return respuesta_api(True, [usuario_schema.dump(nuevo_usuario)], "Usuario creado", 201)
    
@usuarios_bp.route("/<int:id>", methods=["PUT"])   
def editar_usuario(id):    
    usuario = obtener_por_id(id)

    if not usuario:
        return respuesta_api(False, [], "Usuario no encontrado", 404)

    try:
        actualizado = actualizar(usuario, request.get_json())
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as e:
        return respuesta_api(False, [], str(e), 400)
    
    return respuesta_api(True, [usuario_schema.dump(actualizado)], "Usuario actualizado")

@usuarios_bp.route("/<int:id>", methods=["DELETE"])  
def eliminar_usuario(id):
   usuario = obtener_por_id(id)

   if not usuario:
        return respuesta_api(False, [], "Usuario no encontrado", 404)
   
   eliminar(usuario)

   return respuesta_api(True, [], "Usuario eliminado", 200)

# Helper para formatear las respuestas
def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data,list) else (1 if data else 0),
        "message": message
    }), status