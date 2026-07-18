"""Servicio de credenciales y contraseñas del backend.

Este módulo maneja la verificación de la contraseña actual, el cambio
de contraseña, la generación de contraseñas temporales y la reutilización
de contraseñas anteriores.
"""

import secrets
import string

from werkzeug.security import check_password_hash, generate_password_hash

from db import db
from models.credencial_model import Credencial

LONGITUD_MINIMA_PASSWORD = 6
LONGITUD_PASSWORD_TEMPORAL = 10


# Devuelve la credencial actual activa del usuario.
def obtener_por_usuario(id_usuario):
    return Credencial.query.filter_by(id_usuario=id_usuario, activo=True).first()

# compara hash con activa para saber si es contraseña correcta.
def verificar_password(id_usuario, password_plano):

    credencial = obtener_por_usuario(id_usuario)
    if not credencial or not credencial.activo:
        return False

    return check_password_hash(credencial.password_hash, password_plano)


def _validar_longitud_password(password_plano):
    if not password_plano or len(password_plano) < LONGITUD_MINIMA_PASSWORD:
        raise ValueError(
            f"La contraseña debe tener al menos {LONGITUD_MINIMA_PASSWORD} caracteres"
        )


# evito que use una contraseña anterior
def _password_reutilizada(id_usuario, password_plano):

    historial = Credencial.query.filter_by(id_usuario=id_usuario).all()
    return any(
        check_password_hash(credencial.password_hash, password_plano)
        for credencial in historial
    )


# Genero contra temporal para cuando creo un usuario.
def _generar_password_temporal():

    alfabeto = string.ascii_letters + string.digits
    return "".join(secrets.choice(alfabeto) for _ in range(LONGITUD_PASSWORD_TEMPORAL))


# cambiar contraseña. 
def cambiar_password(id_usuario, password_actual, password_nueva, updated_by):
    _validar_longitud_password(password_nueva)

    if password_actual == password_nueva:
        raise ValueError("La nueva contraseña debe ser distinta a la actual")

    if not verificar_password(id_usuario, password_actual):
        raise ValueError("La contraseña actual es incorrecta")

    # Tal vez deberíamos de cambiar el mensaje de error.
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

# Retorno contraseña temporal que 
def crear_password_temporal(id_usuario, created_by):
    password_temporal = _generar_password_temporal()


    # Si por cualquier motivo hay una credencial actual
    # (ej: el usuario olvidó su contraseña y necesitamos resettearla)
    # se actualiza credencial actual a una temporal.
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


def restablecer_password(id_usuario, password_nueva, updated_by):
    """Reemplaza la contraseña sin pedir la actual.

    Este flujo se utiliza cuando el usuario recupera la contraseña mediante OTP.
    """

    _validar_longitud_password(password_nueva)

    if _password_reutilizada(id_usuario, password_nueva):
        raise ValueError("La nueva contraseña no puede coincidir con una anterior")

    credencial_actual = obtener_por_usuario(id_usuario)
    if credencial_actual:
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