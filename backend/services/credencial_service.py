import secrets
import string

from werkzeug.security import check_password_hash, generate_password_hash

from db import db
from models.credencial_model import Credencial

LONGITUD_MINIMA_PASSWORD = 6
LONGITUD_PASSWORD_TEMPORAL = 10


def obtener_por_usuario(id_usuario):
    # revisamos filas históricas, y revisamos por activo=True. debe existir como máximo una fila activa por usuario.
    return Credencial.query.filter_by(id_usuario=id_usuario, activo=True).first()


def verificar_password(id_usuario, password_plano):
    # recibe datos primitivos y devuelve un booleano.
    credencial = obtener_por_usuario(id_usuario)

    # Rechaza si no existe la credencial, o si está marcada inactiva
    if not credencial or not credencial.activo:
        return False

    # check_password_hash re-hashea el password recibido con el mismo salt/algoritmo
    # embebido en el hash guardado, y compara resultado — nunca se descifra el hash original
    # (PBKDF2 es de un solo sentido, no es reversible).
    return check_password_hash(credencial.password_hash, password_plano)


def _validar_longitud_password(password_plano):
    if not password_plano or len(password_plano) < LONGITUD_MINIMA_PASSWORD:
        raise ValueError(
            f"La contraseña debe tener al menos {LONGITUD_MINIMA_PASSWORD} caracteres"
        )


def _password_reutilizada(id_usuario, password_plano):
    historial = Credencial.query.filter_by(id_usuario=id_usuario).all()
    return any(
        check_password_hash(credencial.password_hash, password_plano)
        for credencial in historial
    )


def _generar_password_temporal():
    alfabeto = string.ascii_letters + string.digits
    return "".join(secrets.choice(alfabeto) for _ in range(LONGITUD_PASSWORD_TEMPORAL))


def cambiar_password(id_usuario, password_actual, password_nueva, updated_by):
    _validar_longitud_password(password_nueva)

    if password_actual == password_nueva:
        raise ValueError("La nueva contraseña debe ser distinta a la actual")

    if not verificar_password(id_usuario, password_actual):
        raise ValueError("La contraseña actual es incorrecta")

    if _password_reutilizada(id_usuario, password_nueva):
        raise ValueError("La nueva contraseña no puede coincidir con una anterior")

    credencial_actual = obtener_por_usuario(id_usuario)
    if not credencial_actual:
        raise ValueError("El usuario no tiene una credencial activa")

    credencial_actual.activo = False
    credencial_actual.updated_by = updated_by

    nueva_credencial = Credencial(
        id_usuario=id_usuario,
        password_hash=generate_password_hash(password_nueva),
        created_by=updated_by,
    )
    db.session.add(nueva_credencial)
    db.session.commit()

    return nueva_credencial


def crear_password_temporal(id_usuario, created_by):
    password_temporal = _generar_password_temporal()

    credencial_actual = obtener_por_usuario(id_usuario)
    if credencial_actual:
        credencial_actual.activo = False
        credencial_actual.updated_by = created_by

    nueva_credencial = Credencial(
        id_usuario=id_usuario,
        password_hash=generate_password_hash(password_temporal),
        created_by=created_by,
    )
    db.session.add(nueva_credencial)
    db.session.commit()

    return password_temporal