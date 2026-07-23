"""
Envío de correos vía Flask-Mail.

Mantiene exactamente la misma interfaz pública que la versión mock
(enviar_bienvenida, enviar_otp_activacion, enviar_otp_recuperacion) para
no romper a los callers (usuario_service, credenciales_routes, recuperacion_routes,
activacion_routes).

Los envíos NO deben tirar la operación de negocio si fallan: un error de
SMTP no debería impedir, por ejemplo, que un usuario quede creado en la
base. Se loguea el error y se devuelve False en vez de propagar la excepción.
Si preferís fail-loud (que un fallo de mail rompa la transacción), avisame
y lo cambio — es una decisión de producto, no solo técnica.
"""

import traceback
from flask import current_app
from flask_mail import Message

from db import mail

_ultimos_envios = []  # se mantiene para debugging/tests, igual que el mock


def enviar_mail(destinatario, asunto, cuerpo):
    msg = Message(
        subject=asunto,
        recipients=[destinatario],
        body=cuerpo,
        sender=current_app.config.get("MAIL_DEFAULT_SENDER"),
    )
    try:
        mail.send(msg)
        _ultimos_envios.append({
            "destinatario": destinatario,
            "asunto": asunto,
            "cuerpo": cuerpo,
        })
        return True
    except Exception:
        traceback.print_exc()
        return False

# mail que incluye contraseña temporal y link de activacion.
def enviar_bienvenida(destinatario, password_temporal, link_activacion):
    cuerpo = (
        f"Bienvenido al Sistema de Gestión Académica.\n\n"
        f"Su contraseña temporal es: {password_temporal}\n\n"
        f"Para activar su cuenta, ingrese al siguiente enlace cuando lo desee:\n"
        f"{link_activacion}\n\n"
        f"Al activar, recibirá un código de verificación en otro correo.\n\n"
        f"Recomendamos cambiar su contraseña luego de ingresar."
    )
    return enviar_mail(destinatario, "Bienvenida - Acceso al sistema", cuerpo)


# Envio OTP.
# Envio por mail.
def enviar_otp_activacion(destinatario, codigo):
    cuerpo = (
        f"Su código de activación es: {codigo}\n\n"
        f"El código dura 15 minutos.\n"
    )
    return enviar_mail(destinatario, "Código de activación de cuenta", cuerpo)


def enviar_otp_recuperacion(destinatario, codigo):
    cuerpo = (
        f"Su código para recuperar la contraseña es: {codigo}\n\n"
        f"El código dura 15 minutos.\n"
    )
    return enviar_mail(destinatario, "Recuperación de contraseña", cuerpo)


def obtener_ultimos_envios():
    return list(_ultimos_envios)