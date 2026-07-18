from flask import Blueprint, request, jsonify
import traceback

from services.auth_service import login, CuentaPendienteError

auth_bp = Blueprint("auth", __name__)

# Rutas de autenticación: inicio y cierre de sesión.
# El backend actual usa un mock de email/usuario y tokens simulados.

@auth_bp.route("/login", methods=["POST"])
def iniciar_sesion():
    try:
        req = request.get_json() or {}
        email = req.get("email")
        password = req.get("password")

        if not email or not password:
            return respuesta_api(False, [], "email y password son requeridos", 400)

        data = login(email, password)
        return respuesta_api(True, data, "Inicio de sesión exitoso")

    except CuentaPendienteError as error:
        # Si la cuenta está pendiente, devolvemos un código específico para que el frontend solicite activación.
        return jsonify({
            "ok": False,
            "code": "CUENTA_PENDIENTE",
            "data": {
                "id_usuario": error.id_usuario,
                "email": error.email,
            },
            "message": str(error),
        }), 403

    except ValueError as error:
        return respuesta_api(False, [], str(error), 401)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@auth_bp.route("/logout", methods=["POST"])
def cerrar_sesion():
    # No hay sesión real almacenada en el backend mock; solo respondemos OK.
    return respuesta_api(True, [], "Sesión cerrada")


def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message,
    }), status
