"""
Simula el envío de correos (no hay llamadas a mails reales aun).

Se imprimen en consola del backend y quedan guardados
en _ultimos_envios para consulta durante desarrollo.
"""

_ultimos_envios = []


# mail falso por consola.
def enviar_mail(destinatario, asunto, cuerpo):
    mail = {
        "destinatario": destinatario,
        "asunto": asunto,
        "cuerpo": cuerpo,
    }
    _ultimos_envios.append(mail)

    mensaje = (
        f"\n{'=' * 50}\n"
        f"MAIL → {destinatario}\n"
        f"Asunto: {asunto}\n"
        f"{cuerpo}\n"
        f"{'=' * 50}\n"
    )
    print(mensaje, flush=True)

    return True


# mail falso por consola que incluye contraseña temporal y link de activacion.
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
# Envio por Consola para simular envio por mail.
def enviar_otp_activacion(destinatario, codigo):
    cuerpo = (
        f"Su código de activación es: {codigo}\n\n"
        f"El código dura {15} minutos.\n"
    )
    return enviar_mail(destinatario, "Código de activación de cuenta", cuerpo)


def enviar_otp_recuperacion(destinatario, codigo):
    cuerpo = (
        f"Su código para recuperar la contraseña es: {codigo}\n\n"
        f"El código dura {15} minutos.\n"
    )
    return enviar_mail(destinatario, "Recuperación de contraseña", cuerpo)


def obtener_ultimos_envios():
    return list(_ultimos_envios)
