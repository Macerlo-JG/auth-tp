"""
Escritura de la sesion de usuario en Redis.

session:{id_usuario} -> Hash (roles, acciones, refresh_jti, id_persona, id_legajo)

Responsabilidad exclusiva de Auth: es el unico servicio que hace
login/logout/refresh y cambios de rol, por lo tanto el unico que escribe
sesiones. La lectura (obtener_sesion) y el nombre de la key
(clave_sesion) siguen estando en auth_common, compartidos con el resto
de los microservicios.

Usa un cliente Redis propio, independiente del que arma AuthCommon
internamente.
"""

import json
import redis

from auth_common.sesion_common import clave_sesion

from config.config import Config

_redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)


def crear_sesion(id_usuario, roles, acciones, refresh_jti, id_persona, id_legajo):
    clave = clave_sesion(id_usuario)

    _redis_client.hset(clave, mapping={
        "roles": json.dumps(roles),
        "acciones": json.dumps(acciones),
        "refresh_jti": refresh_jti,
        "id_persona": str(id_persona),
        "id_legajo": str(id_legajo) if id_legajo is not None else "",
    })
    _redis_client.expire(clave, Config.AUTH_COMMON_SESSION_TTL)


def renovar_sesion(id_usuario):
    # True si la sesion existia y se renovo, False si ya no existia.
    return bool(
        _redis_client.expire(clave_sesion(id_usuario), Config.AUTH_COMMON_SESSION_TTL)
    )


def actualizar_permisos_sesion(id_usuario, roles, acciones):
    """
    Sobrescribe roles/acciones de una sesion existente, sin tocar
    refresh_jti, id_persona ni el TTL. Devuelve False si la sesion no
    existia (se actualiza sola en el proximo login).
    """
    clave = clave_sesion(id_usuario)

    if not _redis_client.exists(clave):
        return False

    _redis_client.hset(clave, mapping={
        "roles": json.dumps(roles),
        "acciones": json.dumps(acciones),
    })
    return True


def eliminar_sesion(id_usuario):
    _redis_client.delete(clave_sesion(id_usuario))