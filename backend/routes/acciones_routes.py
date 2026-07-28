from flask import Blueprint, request
from marshmallow import ValidationError
import traceback

from db import db
from models.accion import Accion
from schemas.accion_schemas import acciones_schema
from services.acciones_service import registrar_acciones
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

"""
Endpoint de registro de acciones, roles y relaciones rol-acción.
Lo llama cada microservicio (Legajo, Inscripción) al arrancar, con el
contenido de su acciones.yml.
"""

acciones_bp = Blueprint("acciones", __name__, url_prefix="/acciones")

@acciones_bp.route("", methods=["GET"])
@requires_permission("auth.roles.control_parcial")
def listar_acciones():
    try:
        acciones = Accion.query.filter_by(activo=True).all()
        data = acciones_schema.dump(acciones)
        return respuesta_api(True, data)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

@acciones_bp.route("", methods=["POST"])
@requires_permission(only_services=True)
def registrar():
    req = request.get_json()

    try:
        conflictos = registrar_acciones(req)
    except ValidationError as e:
        return respuesta_api(False, [], e.messages, 400)
    except Exception as error:
        db.session.rollback()
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)

    if conflictos:
        return respuesta_api(True, conflictos, "Registro procesado con conflictos")

    return respuesta_api(True, [], "Registro procesado correctamente")