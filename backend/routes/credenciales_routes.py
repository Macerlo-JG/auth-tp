from flask import Blueprint, request, jsonify
import traceback
from services.credencial_service import verificar_password

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


def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message
    }), status