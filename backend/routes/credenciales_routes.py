from flask import Blueprint, request, jsonify
import traceback
from services.credencial_service import (
    verificar_password,
    cambiar_password,
    crear_password_temporal,
)
from services.usuario_service import obtener_por_id

credenciales_bp = Blueprint("credenciales", __name__, url_prefix="/credenciales")


@credenciales_bp.route("/verificar", methods=["POST"])
def verificar_credencial():
    try:
        # solo necesitamos dos campos sueltos
        req = request.get_json()
        id_usuario = req.get("id_usuario")
        password = req.get("password")

        # Validación de presencia de datos
        if not id_usuario or not password:
            return respuesta_api(False, [], "id_usuario y password son requeridos", 400)

        # logica de negocio en service
        coincide = verificar_password(id_usuario, password)

        if not coincide:
            return respuesta_api(False, [], "Credenciales inválidas", 401)

        return respuesta_api(True, [], "Credenciales válidas")

    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@credenciales_bp.route("/cambiar", methods=["POST"])
def cambiar_credencial():
    try:
        req = request.get_json() or {}
        id_usuario = req.get("id_usuario")
        password_actual = req.get("password_actual")
        password_nueva = req.get("password_nueva")
        updated_by = req.get("updated_by", id_usuario)

        if not id_usuario or not password_actual or not password_nueva:
            return respuesta_api(
                False,
                [],
                "id_usuario, password_actual y password_nueva son requeridos",
                400,
            )

        usuario = obtener_por_id(id_usuario)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)

        cambiar_password(id_usuario, password_actual, password_nueva, updated_by)
        return respuesta_api(True, [], "Contraseña actualizada correctamente")

    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@credenciales_bp.route("/temporal", methods=["POST"])
def crear_credencial_temporal():
    try:
        req = request.get_json() or {}
        id_usuario = req.get("id_usuario")
        created_by = req.get("created_by", 1)

        if not id_usuario:
            return respuesta_api(False, [], "id_usuario es requerido", 400)

        usuario = obtener_por_id(id_usuario)
        if not usuario:
            return respuesta_api(False, [], "Usuario no encontrado", 404)

        password_temporal = crear_password_temporal(id_usuario, created_by)
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


def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message
    }), status