from flask import Blueprint, request, g, send_from_directory
import traceback

from services.documento_legal_service import (
    obtener_todos,
    obtener_pendientes_para_usuario,
    publicar_documento,
    aceptar_documento,
    CARPETA_UPLOADS,
)
from schemas.documento_legal_schemas import documento_legal_schema, documentos_legales_schema
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import requires_permission

documentos_legales_bp = Blueprint(
    "documentos_legales", __name__, url_prefix="/documentos-legales"
)


@documentos_legales_bp.route("", methods=["GET"])
#@requires_permission("auth.documentos_legales.control_parcial")
def listar_documentos():
    try:
        documentos = obtener_todos()
        return respuesta_api(True, documentos_legales_schema.dump(documentos))
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@documentos_legales_bp.route("/pendientes", methods=["GET"])
def documentos_pendientes():
    try:
        pendientes = obtener_pendientes_para_usuario(g.id_usuario, g.roles)
        return respuesta_api(True, documentos_legales_schema.dump(pendientes))
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@documentos_legales_bp.route("", methods=["POST"])
#@requires_permission("auth.documentos_legales.control_parcial")
def crear_documento():
    try:
        tipo = request.form.get("tipo")
        version = request.form.get("version")
        titulo = request.form.get("titulo")
        fecha_publicacion = request.form.get("fechaPublicacion")
        archivo = request.files.get("archivo")

        # Cada rol como un campo "roles" separado en el form-data.
        nombres_roles = request.form.getlist("roles")

        nuevo = publicar_documento(
            tipo=tipo,
            version=version,
            titulo=titulo,
            archivo_werkzeug=archivo,
            created_by=g.id_usuario,
            fecha_publicacion=fecha_publicacion,
            nombres_roles=nombres_roles,
        )
        return respuesta_api(True, [documento_legal_schema.dump(nuevo)], "Documento publicado", 201)
    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@documentos_legales_bp.route("/<int:id_documento>/aceptar", methods=["POST"])
def aceptar(id_documento):
    try:
        aceptar_documento(g.id_usuario, id_documento)
        return respuesta_api(True, [], "Documento aceptado correctamente")
    except ValueError as error:
        return respuesta_api(False, [], str(error), 400)
    except Exception as error:
        traceback.print_exc()
        return respuesta_api(False, [], str(error), 500)


@documentos_legales_bp.route("/archivos/<path:nombre_archivo>", methods=["GET"])
def descargar_archivo(nombre_archivo):
    return send_from_directory(CARPETA_UPLOADS, nombre_archivo)