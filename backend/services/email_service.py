"""
Servicio de envío de correos electrónicos.

Utiliza Flask-Mail para enviar correos mediante SMTP.
Si no hay configuración disponible, registra en consola para desarrollo.
"""

from flask_mail import Mail, Message
from flask import current_app
import traceback

_ultimos_envios = []


def _mail_disponible():
    """Verifica si hay configuración de correo disponible."""
    return (
        current_app.config.get('MAIL_SERVER') 
        and current_app.config.get('MAIL_USERNAME')
        and current_app.config.get('MAIL_PASSWORD')
    )


def enviar_mail(destinatario, asunto, cuerpo):
    """
    Envía un correo electrónico.
    
    Si hay configuración de SMTP, lo envía por correo real.
    Si no, lo registra en consola (útil para desarrollo).
    """
    mail_record = {
        "destinatario": destinatario,
        "asunto": asunto,
        "cuerpo": cuerpo,
    }
    _ultimos_envios.append(mail_record)

    if not _mail_disponible():
        # Modo desarrollo: mostrar en consola
        mensaje = (
            f"\n{'=' * 60}\n"
            f"📧 CORREO (MODO DESARROLLO - CONSOLA)\n"
            f"{'=' * 60}\n"
            f"Para: {destinatario}\n"
            f"Asunto: {asunto}\n"
            f"{'-' * 60}\n"
            f"{cuerpo}\n"
            f"{'=' * 60}\n"
        )
        print(mensaje, flush=True)
        return True

    try:
        # Envío real por SMTP
        msg = Message(
            subject=asunto,
            recipients=[destinatario],
            body=cuerpo,
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        
        mail = current_app.extensions.get('mail')
        if mail:
            mail.send(msg)
            print(f"✅ Correo enviado a {destinatario}", flush=True)
            return True
        else:
            print(f"⚠️ Flask-Mail no inicializado", flush=True)
            return False
            
    except Exception as e:
        print(f"❌ Error al enviar correo a {destinatario}: {str(e)}", flush=True)
        traceback.print_exc()
        return False


def enviar_bienvenida(destinatario, password_temporal, link_activacion):
    """Envía correo de bienvenida con contraseña temporal."""
    cuerpo = (
        f"Bienvenido al Sistema de Gestión Académica.\n\n"
        f"Su contraseña temporal es: {password_temporal}\n\n"
        f"Para activar su cuenta, ingrese al siguiente enlace cuando lo desee:\n"
        f"{link_activacion}\n\n"
        f"Al activar, recibirá un código de verificación en otro correo.\n\n"
        f"Recomendamos cambiar su contraseña luego de ingresar."
    )
    return enviar_mail(destinatario, "Bienvenida - Acceso al sistema", cuerpo)


def enviar_otp_activacion(destinatario, codigo):
    """Envía correo con código OTP para activación de cuenta."""
    cuerpo = (
        f"Su código de activación es: {codigo}\n\n"
        f"El código dura 10 minutos.\n\n"
        f"Para pruebas también puede usar el código: temporal"
    )
    return enviar_mail(destinatario, "Código de activación de cuenta", cuerpo)


def enviar_otp_recuperacion(destinatario, codigo):
    """Envía correo con código OTP para recuperación de contraseña."""
    cuerpo = (
        f"Su código para recuperar la contraseña es: {codigo}\n\n"
        f"El código dura 10 minutos.\n\n"
        f"Para pruebas también puede usar el código: temporal"
    )
    return enviar_mail(destinatario, "Recuperación de contraseña", cuerpo)


def obtener_ultimos_envios():
    """Devuelve el registro de últimos correos enviados (para debugging)."""
    return list(_ultimos_envios)
