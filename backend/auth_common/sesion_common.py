"""
Operaciones sobre la sesión de usuario en Redis.

session:{id_usuario}  -> Hash (roles, acciones, refresh_jti, id_persona)

Modelo de sesión única por usuario: un segundo login sobreescribe directamente el mismo Hash con HSET, no crea una sesión aparte.
"""

import json

from auth_common.redis_client import redis_client
from config.config import Config


def clave_sesion(id_usuario):
    return f"session:{id_usuario}"

def crear_sesion(id_usuario, roles, acciones, refresh_jti, id_persona):
    clave = clave_sesion(id_usuario)

    redis_client.hset(clave, mapping={
        "roles": json.dumps(roles),
        "acciones": json.dumps(acciones),
        "refresh_jti": refresh_jti,
        "id_persona": str(id_persona),
    })
    redis_client.expire(clave, Config.JWT_ACCESS_TOKEN_EXPIRES)

def obtener_sesion(id_usuario):
    datos = redis_client.hgetall(clave_sesion(id_usuario))

    if not datos:
        return None

    return {
        "roles": json.loads(datos["roles"]),
        "acciones": json.loads(datos["acciones"]),
        "refresh_jti": datos["refresh_jti"],
        "id_persona": datos["id_persona"],
    }

def renovar_sesion(id_usuario):
    # Renueva el TTL de la sesión (mismo valor que al crearla).
    # True si la sesión existía y se renovó, False si ya no existía.
    return bool(
        redis_client.expire(clave_sesion(id_usuario), Config.JWT_ACCESS_TOKEN_EXPIRES)
    )

def eliminar_sesion(id_usuario):
    redis_client.delete(clave_sesion(id_usuario))