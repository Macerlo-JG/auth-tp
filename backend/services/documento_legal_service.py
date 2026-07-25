"""
Servicio de documentos legales.

Regla central: solo puede haber un documento con vigente=True por cada
"tipo". Al publicar uno nuevo, el anterior pasa a no vigente (nunca se
borra, queda como historial).

La versión ya no la elige quien publica: se calcula sola, contando
cuántas veces se publicó ese tipo antes.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta

from werkzeug.utils import secure_filename

from db import db
from models.documento_legal_model import DocumentoLegal
from models.usuario_documento_legal_model import UsuarioDocumentoLegal
from models.rol import Rol

CARPETA_UPLOADS = "/app/uploads/documentos_legales"
EXTENSIONES_PERMITIDAS = {".pdf"}

# Límite para la fecha "vigente desde": no puede ser muy lejana en el futuro.
ANIOS_MAXIMO_A_FUTURO = 3


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


def _siguiente_version(tipo):
    """Cuenta cuántas veces se publicó este tipo de documento y devuelve
    el número que sigue, como texto (ej: "1", "2", "3")."""
    cantidad = DocumentoLegal.query.filter_by(tipo=tipo).count()
    return str(cantidad + 1)


def _validar_fecha_publicacion(fecha_publicacion):
    """La fecha no puede ser anterior a hoy, ni más de
    ANIOS_MAXIMO_A_FUTURO años posterior a hoy."""
    ahora = datetime.now(timezone.utc)
    hoy = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    limite_futuro = hoy + timedelta(days=365 * ANIOS_MAXIMO_A_FUTURO)

    fecha_comparar = fecha_publicacion
    if fecha_comparar.tzinfo is None:
        fecha_comparar = fecha_comparar.replace(tzinfo=timezone.utc)

    if fecha_comparar < hoy:
        raise ValueError("La fecha de vigencia no puede ser anterior a hoy")
    if fecha_comparar > limite_futuro:
        raise ValueError(f"La fecha de vigencia no puede ser más de {ANIOS_MAXIMO_A_FUTURO} años posterior a hoy")


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


def publicar_documento(tipo, titulo, archivo_werkzeug, created_by,
                        fecha_publicacion=None, nombres_roles=None):
    """La versión ya no se recibe como parámetro: se calcula sola."""
    tipo = (tipo or "").strip().lower()
    if not tipo:
        raise ValueError("El tipo de documento es requerido")
    if not titulo or not str(titulo).strip():
        raise ValueError("El título es requerido")
    if not archivo_werkzeug:
        raise ValueError("El archivo PDF es requerido")

    fecha_final = fecha_publicacion or datetime.now(timezone.utc)
    _validar_fecha_publicacion(fecha_final)

    roles_normalizados = _validar_y_normalizar_roles(nombres_roles)
    ruta_contenido = _guardar_archivo(archivo_werkzeug)
    version = _siguiente_version(tipo)

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
            version=version,
            titulo=str(titulo).strip(),
            contenido=ruta_contenido,
            fecha_de_publicacion=fecha_final,
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