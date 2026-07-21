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
    """Genera un OTP numérico de 6 dígitos, lo hashea y lo almacena en Redis.

    Devuelve el código en claro (para enviarlo por mail/SMS).
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

    - Si no hay código vigente (vencido o inexistente): False.
    - Si se superó MAX_INTENTOS: invalida el OTP y devuelve False, aunque
      el código ingresado esa vez sea el correcto (fuerza bruta agotada).
    - Si es correcto y consumir=True (default): BORRA el OTP y el contador
      de intentos de Redis antes de devolver True. Un OTP es de un solo
      uso; llamar de nuevo con el mismo código después de un True ya no
      encuentra nada y devuelve False.
    - Si es correcto y consumir=False: devuelve True SIN borrar el OTP.
      Existe para flujos de dos pasos (ej: recuperación de contraseña),
      donde primero se confirma que el código es válido para habilitar el
      formulario de nueva contraseña (`/recuperacion/verificar-otp`, no
      debe gastar el código), y recién en un segundo llamado -- el que
      efectivamente aplica el cambio (`/recuperacion/cambiar`) -- se
      consume de verdad. Si ambos pasos consumieran el código, el segundo
      paso siempre fallaría con "código inválido o expirado" porque el
      primero ya lo habría borrado.
    - Si es incorrecto: incrementa el contador de intentos y devuelve False
      (esto pasa siempre, consuma o no, para que el límite de intentos
      cuente también los chequeos de "vista previa").
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
        # Cupo de intentos agotado: se invalida el OTP directamente,
        # el usuario tiene que pedir uno nuevo.
        redis_client.delete(key)
        redis_client.delete(clave_intentos)
        return False

    ok = check_password_hash(hashed, codigo_ingresado.strip())

    if ok:
        if consumir:
            redis_client.delete(key)
            redis_client.delete(clave_intentos)
        return True

    # Intento fallido: se registra, conservando el mismo TTL que el OTP
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

    Ya no hace falta llamarla después de un verificar_otp exitoso (eso lo
    hace la propia función). Sigue siendo útil para invalidar un código
    vigente sin haberlo validado -- por ejemplo si se quiere cancelar un
    flujo de activación/recuperación a mitad de camino.
    """
    redis_client.delete(_clave(tipo, email))
    redis_client.delete(_clave_intentos(tipo, email))