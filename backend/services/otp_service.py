"""Servicio de OTP (códigos de un solo uso) respaldado en Redis.

Se usa para activación de cuenta y recuperación de contraseña. Cada OTP:
  - se genera con `secrets` (criptográficamente seguro, no `random`).
  - se guarda hasheado en Redis con expiración de TTL_MINUTOS.
  - se borra automáticamente apenas se valida con éxito (no reutilizable).
  - tiene un límite de intentos fallidos para evitar fuerza bruta dentro
    de la ventana de vigencia.
"""

import secrets
import string

from werkzeug.security import generate_password_hash, check_password_hash

from auth_common.redis_client import redis_client

# Duración en minutos del OTP según requerimiento
TTL_MINUTOS = 15

# Intentos fallidos permitidos antes de invalidar el OTP
MAX_INTENTOS = 5


def _clave(tipo, email):
    return f"otp:{tipo}:{email.strip().lower()}"


def _clave_intentos(tipo, email):
    return f"otp:intentos:{tipo}:{email.strip().lower()}"


def generar_otp(tipo, email):
    """Genera un OTP, lo hashea y lo almacena en Redis.

    Devuelve el código en claro para enviarlo por mail.
    Reinicia el contador de intentos fallidos: un código nuevo empieza
    con el cupo de intentos completo, aunque el anterior lo hubiera agotado.
    """
    codigo = "".join(secrets.choice(string.digits) for _ in range(6))
    hashed = generate_password_hash(codigo)

    key = _clave(tipo, email)
    ttl_segundos = int(TTL_MINUTOS * 60)
    redis_client.setex(key, ttl_segundos, hashed)

    # Nuevo código -> nuevo cupo de intentos.
    redis_client.delete(_clave_intentos(tipo, email))

    return codigo


def verificar_otp(tipo, email, codigo_ingresado, consumir=True):
    """Valida el código ingresado contra el hash guardado en Redis.
    -Si el OTP no existe o está vencido devuelve False.
    - Si se alcanzó el límite de intentos invalida el OTP y devuelve False.
    - Si el código es correcto elimina el OTP y el contador de intentos.
    Con consumir=False valida el código sin eliminarlo, permitiendo flujos de dos pasos donde se verifica primero y se consume después.
    Si el código es incorrecto aumenta el contador de intentos y devuelve False, independientemente de si se consume o no.
    """
    if not codigo_ingresado:
        return False

    key = _clave(tipo, email)
    hashed = redis_client.get(key)
    if not hashed:
        return False

    clave_intentos = _clave_intentos(tipo, email)
    intentos_previos = int(redis_client.get(clave_intentos) or 0)

    if intentos_previos >= MAX_INTENTOS:
        # intentos agotado.
        redis_client.delete(key)
        redis_client.delete(clave_intentos)
        return False

    ok = check_password_hash(hashed, codigo_ingresado.strip())

    if ok:
        if consumir:
            redis_client.delete(key)
            redis_client.delete(clave_intentos)
        return True

    # Intento fallido se registra, conservando el mismo TTL que el OTP
    # para que el contador no sobreviva más que el propio código.
    ttl_restante = redis_client.ttl(key)
    nuevos_intentos = intentos_previos + 1
    redis_client.setex(
        clave_intentos,
        ttl_restante if ttl_restante and ttl_restante > 0 else int(TTL_MINUTOS * 60),
        nuevos_intentos,
    )
    return False


def eliminar_otp(tipo, email):
    """Invalida el OTP y su contador de intentos manualmente.
    Invalida un código vigente.
    """
    redis_client.delete(_clave(tipo, email))
    redis_client.delete(_clave_intentos(tipo, email))