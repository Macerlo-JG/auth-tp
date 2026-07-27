from flask import Blueprint
import traceback

from mock.emails_usuario import EMAIL_POR_ID_PERSONA
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

"""
Expone el único diccionario real de personas que existe hoy
(mock/emails_usuario.py). Cuando exista el servicio real de Legajo,
este archivo se reemplaza sin tocar el resto del sistema.
"""

personas_bp = Blueprint("personas", __name__, url_prefix="/auth/personas")


@personas_bp.route("", methods=["GET"])
@requires_permission("auth.usuarios.ver")
def listar_personas():
    try:
        # El diccionario solo tiene id_persona -> email, no hay nombre
        # ni apellido en ningún lado real del sistema todavía.
        personas = [
            {"id_persona": id_persona, "email": email}
            for id_persona, email in EMAIL_POR_ID_PERSONA.items()
        ]
        return respuesta_api(True, personas)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)