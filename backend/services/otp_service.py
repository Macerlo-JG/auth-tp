import random
import string
from datetime import datetime, timedelta, timezone

# Almacén en memoria para OTPs. No hay persistencia real ni Redis aún.
# La clave distingue el tipo de flujo (activación, recuperación) y el email.
_otps = {}
# Diccionario en memoria que guarda codigo y el mail

TTL_MINUTOS = 10
CODIGO_PRUEBA = "temporal"


# normaliza email y guardo tipo de otp (activacion, cambio de mail principal,
# por ejemplo, etc. en caso de que se pida mas de un otp muy rapido)
def _clave(tipo, email):
    return f"{tipo}:{email.strip().lower()}"


# función de generación de OTP
def generar_otp(tipo, email):
    """Genera un código OTP numérico de 6 dígitos y lo guarda temporalmente."""
    codigo = "".join(random.choices(string.digits, k=6))
    _otps[_clave(tipo, email)] = {
        "codigo": codigo,
        "expira_en": datetime.now(timezone.utc) + timedelta(minutes=TTL_MINUTOS),
    }
    return codigo


def verificar_otp(tipo, email, codigo_ingresado):
    """Verifica si el OTP enviado por el usuario es válido."""
    if not codigo_ingresado:
        return False

    # Código de prueba para desarrollo: permite bypass de validación.
    if codigo_ingresado.strip() == CODIGO_PRUEBA:
        return True

    registro = _otps.get(_clave(tipo, email))
    if not registro:
        return False

    # Actualmente no se valida expiración real, solo el valor.
    if registro["codigo"] != codigo_ingresado.strip():
        return False

    return True


def eliminar_otp(tipo, email):
    """Borra el OTP una vez usado o cuando finaliza el flujo."""
    _otps.pop(_clave(tipo, email), None)
