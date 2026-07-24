"""
Servicio de documentos legales.

Regla de negocio central: solo puede haber un documento con vigente=True
por cada valor de `tipo`. Al publicar uno nuevo, el anterior (si existe)
se marca vigente=False -- nunca se borra, se conserva como historial.

Filtro por rol: `roles_requeridos` es un string separado por comas.
Vacío/NULL = aplica a todos los usuarios. Sin integridad referencial
contra la tabla `roles` (ver nota en el modelo).
"""
import os
import uuid
from datetime import datetime, timezone

from werkzeug.utils import secure_filename

from db import db
from models.documento_legal_model import DocumentoLegal
from models.usuario_documento_legal_model import UsuarioDocumentoLegal
from models.rol import Rol

CARPETA_UPLOADS = "/app/uploads/documentos_legales"
EXTENSIONES_PERMITIDAS = {".pdf"}


def _guardar_archivo(archivo_werkzeug):
    nombre_original = secure_filename(archivo_werkzeug.filename or "")
    _, extension = os.path.splitext(nombre_original)
    extension = extension.lower()

    if extension not in EXTENSIONES_PERMITIDAS:
        raise ValueError("El archivo debe ser un PDF")

    os.makedirs(CARPETA_UPLOADS, exist_ok=True)
    nombre_final = f"{uuid.uuid4().hex}{extension}"
    ruta_absoluta = os.path.join(CARPETA_UPLOADS, nombre_final)
    archivo_werkzeug.save(ruta_absoluta)

    return f"/documentos-legales/archivos/{nombre_final}"


def obtener_todos():
    return (
        DocumentoLegal.query
        .filter_by(activo=True)
        .order_by(DocumentoLegal.tipo, DocumentoLegal.created_at.desc())
        .all()
    )


def obtener_vigentes():
    return DocumentoLegal.query.filter_by(activo=True, vigente=True).all()


def obtener_pendientes_para_usuario(id_usuario, roles_usuario):
    """
    roles_usuario: lista de nombres de rol del usuario (ej. ["ALUMNO"]),
    tal como ya vive en flask.g.roles durante la request.
    """
    vigentes = obtener_vigentes()

    ids_aceptados = {
        a.id_documento
        for a in UsuarioDocumentoLegal.query.filter_by(id_usuario=id_usuario, activo=True).all()
    }

    def aplica_al_usuario(doc):
        requeridos = doc.lista_roles_requeridos()
        if not requeridos:
            return True
        return any(r in roles_usuario for r in requeridos)

    return [
        doc for doc in vigentes
        if doc.id_documento not in ids_aceptados and aplica_al_usuario(doc)
    ]


def _validar_y_normalizar_roles(nombres_roles):
    """Valida que cada rol exista y devuelve el string listo para guardar
    en la columna (o None si la lista queda vacía)."""
    if not nombres_roles:
        return None

    limpios = []
    for nombre in nombres_roles:
        nombre = (nombre or "").strip()
        if not nombre:
            continue
        if not Rol.query.filter_by(nombre=nombre).first():
            raise ValueError(f"El rol '{nombre}' no existe")
        limpios.append(nombre)

    return ",".join(limpios) if limpios else None


def publicar_documento(tipo, version, titulo, archivo_werkzeug, created_by,
                        fecha_publicacion=None, nombres_roles=None):
    tipo = (tipo or "").strip().lower()
    if not tipo:
        raise ValueError("El tipo de documento es requerido")
    if not version or not str(version).strip():
        raise ValueError("La versión es requerida")
    if not titulo or not str(titulo).strip():
        raise ValueError("El título es requerido")
    if not archivo_werkzeug:
        raise ValueError("El archivo PDF es requerido")

    # Se valida ANTES de guardar el archivo en disco: si un rol no existe,
    # preferimos fallar rápido y no dejar un PDF huérfano en el filesystem.
    roles_normalizados = _validar_y_normalizar_roles(nombres_roles)

    ruta_contenido = _guardar_archivo(archivo_werkzeug)

    with db.session.begin_nested():
        anterior = (
            db.session.query(DocumentoLegal)
            .filter_by(tipo=tipo, vigente=True, activo=True)
            .with_for_update()
            .first()
        )

        if anterior:
            anterior.vigente = False
            anterior.updated_by = created_by

        nuevo = DocumentoLegal(
            tipo=tipo,
            version=str(version).strip(),
            titulo=str(titulo).strip(),
            contenido=ruta_contenido,
            fecha_de_publicacion=fecha_publicacion or datetime.now(timezone.utc),
            vigente=True,
            created_by=created_by,
            roles_requeridos=roles_normalizados,
        )
        db.session.add(nuevo)

    db.session.commit()
    return nuevo


def aceptar_documento(id_usuario, id_documento):
    documento = DocumentoLegal.query.filter_by(id_documento=id_documento, activo=True).first()
    if not documento:
        raise ValueError("Documento no encontrado")

    if not documento.vigente:
        raise ValueError("Este documento ya no es la versión vigente")

    ya_aceptado = UsuarioDocumentoLegal.query.filter_by(
        id_usuario=id_usuario, id_documento=id_documento, activo=True
    ).first()
    if ya_aceptado:
        raise ValueError("Ya aceptaste este documento")

    aceptacion = UsuarioDocumentoLegal(
        id_usuario=id_usuario, id_documento=id_documento, created_by=id_usuario,
    )
    db.session.add(aceptacion)
    db.session.commit()
    return aceptacion