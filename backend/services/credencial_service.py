"""Servicio de credenciales y contraseñas del backend.

Este módulo maneja la verificación de la contraseña actual, el cambio
de contraseña, la generación de contraseñas temporales y la reutilización
de contraseñas anteriores.

Las funciones de este módulo NO hacen commit por su cuenta cuando forman
parte de un flujo más grande (ej: crear_password_temporal, que se usa
tanto standalone como dentro de crear_completo en usuario_service).
`cambiar_password` y `restablecer_password` sí comitean porque son
operaciones atómicas de un solo paso invocadas directamente desde una ruta.
Si en el futuro se combinan con otras operaciones, hay que sacarles el
commit interno y dejarlo a cargo del orquestador, igual que se hizo con
crear_password_temporal.
"""

import secrets
import string

from werkzeug.security import check_password_hash, generate_password_hash

from db import db
from models.credencial_model import Credencial

LONGITUD_MINIMA_PASSWORD = 6
LONGITUD_PASSWORD_TEMPORAL = 10


def obtener_por_usuario(id_usuario):
    """Devuelve la credencial marcada como `es_actual` (y `activo`) para el usuario."""
    return Credencial.query.filter_by(
        id_usuario=id_usuario, es_actual=True, activo=True
    ).first()


def verificar_password(id_usuario, password_plano):
    """Compara el hash de la credencial activa contra la contraseña ingresada."""
    credencial = obtener_por_usuario(id_usuario)
    if not credencial or not credencial.activo or not credencial.es_actual:
        return False
    return check_password_hash(credencial.password_hash, password_plano)


def _validar_longitud_password(password_plano):
    """Lanza ValueError si la contraseña no cumple la longitud mínima."""
    if not password_plano or len(password_plano) < LONGITUD_MINIMA_PASSWORD:
        raise ValueError(
            f"La contraseña debe tener al menos {LONGITUD_MINIMA_PASSWORD} caracteres"
        )


def _password_reutilizada(id_usuario, password_plano):
    """Evita que el usuario reutilice cualquier contraseña de su historial
    (incluye temporales generadas por el sistema)."""
    historial = Credencial.query.filter_by(id_usuario=id_usuario).all()
    return any(
        check_password_hash(credencial.password_hash, password_plano)
        for credencial in historial
    )


def _generar_password_temporal():
    """Genera una contraseña temporal aleatoria criptográficamente segura."""
    alfabeto = string.ascii_letters + string.digits
    return "".join(secrets.choice(alfabeto) for _ in range(LONGITUD_PASSWORD_TEMPORAL))


def cambiar_password(id_usuario, password_actual, password_nueva, updated_by):
    """Cambia la contraseña de un usuario, validando la contraseña actual.

    Operación atómica de un solo paso -> comitea internamente.
    """
    _validar_longitud_password(password_nueva)

    if password_actual == password_nueva:
        raise ValueError("La nueva contraseña debe ser distinta a la actual")

    if not verificar_password(id_usuario, password_actual):
        raise ValueError("La contraseña actual es incorrecta")

    if _password_reutilizada(id_usuario, password_nueva):
        raise ValueError("La nueva contraseña no puede coincidir con una anterior")

    # Garantizar atomicidad: marcar la credencial actual como no `es_actual`
    # y crear la nueva fila en la misma transacción con bloqueo FOR UPDATE.
    # begin_nested() (SAVEPOINT) permite anidamiento si ya existe una
    # transacción activa en la sesión (ej: manejadores de Flask).
    with db.session.begin_nested():
        credencial_actual = (
            db.session.query(Credencial)
            .filter_by(id_usuario=id_usuario, es_actual=True, activo=True)
            .with_for_update()
            .first()
        )

        if not credencial_actual:
            raise ValueError("El usuario no tiene una credencial activa")

        credencial_actual.es_actual = False
        credencial_actual.updated_by = updated_by

        nueva_credencial = Credencial(
            id_usuario=id_usuario,
            password_hash=generate_password_hash(password_nueva),
            created_by=updated_by,
            es_actual=True,
        )
        db.session.add(nueva_credencial)

    db.session.commit()
    return nueva_credencial


def crear_password_temporal(id_usuario, created_by):
    """Genera una contraseña temporal, desactiva la credencial actual (si existe)
    y crea una nueva credencial temporal.

    NO comitea: queda a cargo del llamador (ej: usuario_service.crear_completo),
    porque esta función suele ejecutarse como parte de una operación mayor
    (crear usuario + credencial + email) que debe confirmarse toda junta.
    Si se llama de forma standalone, el caller es responsable de hacer
    db.session.commit() después.
    """
    password_temporal = _generar_password_temporal()

    with db.session.begin_nested():
        credencial_actual = (
            db.session.query(Credencial)
            .filter_by(id_usuario=id_usuario, es_actual=True, activo=True)
            .with_for_update()
            .first()
        )

        if credencial_actual:
            credencial_actual.es_actual = False
            credencial_actual.updated_by = created_by

        nueva_credencial = Credencial(
            id_usuario=id_usuario,
            password_hash=generate_password_hash(password_temporal),
            created_by=created_by,
            es_actual=True,
        )
        db.session.add(nueva_credencial)

    # Antes: había un `return password_temporal` ACÁ que cortaba la función
    # antes de llegar al commit() de abajo, dejándolo como código muerto.
    # Se removió el commit interno (ver docstring): el commit ahora es
    # responsabilidad del llamador.
    return password_temporal


def restablecer_password(id_usuario, password_nueva, updated_by):
    """Reemplaza la contraseña sin pedir la actual.

    Este flujo se utiliza cuando el usuario recupera la contraseña mediante OTP.
    Operación atómica de un solo paso -> comitea internamente.
    """
    _validar_longitud_password(password_nueva)

    if _password_reutilizada(id_usuario, password_nueva):
        raise ValueError("La nueva contraseña no puede coincidir con una anterior")

    with db.session.begin_nested():
        credencial_actual = (
            db.session.query(Credencial)
            .filter_by(id_usuario=id_usuario, es_actual=True, activo=True)
            .with_for_update()
            .first()
        )

        if credencial_actual:
            credencial_actual.es_actual = False
            credencial_actual.updated_by = updated_by

        nueva_credencial = Credencial(
            id_usuario=id_usuario,
            password_hash=generate_password_hash(password_nueva),
            created_by=updated_by,
            es_actual=True,
        )
        db.session.add(nueva_credencial)

    db.session.commit()
    return nueva_credencial