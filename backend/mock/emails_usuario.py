"""
Mock temporal de personas — relación email <-> id_persona.

Reemplaza a los antiguos `mock/emails_usuario.py` y `mocks/persona_mock_service.py`.
Esos dos módulos mantenían diccionarios separados y a mano (uno mapeaba
email -> id_usuario, el otro email -> id_persona), sin ninguna garantía de
que estuvieran sincronizados. Fue la causa del bug donde `pendiente@test.com`
se activaba correctamente pero el login siempre fallaba: activación resolvía
un id_usuario válido, login resolvía un id_persona que ni siquiera existía
en su propio diccionario.

Este es el ÚNICO lugar del backend donde se define qué usuarios de prueba
existen y su email. Todo el código (login, activación, recuperación, alta
de usuarios) pasa por las funciones de acá, nunca accede al diccionario
directamente.

Cuando se integre el servicio real de Legajo, este archivo se reemplaza por
las llamadas a ese servicio y el resto del código no debería necesitar
cambios, porque ya depende solo de estas funciones.

id_persona vs id_usuario:
    id_persona es el identificador "externo" (vendría de Legajo).
    id_usuario es el PK interno de la tabla Usuario, asignado por la DB.
    Este mock SOLO conoce id_persona <-> email. Para llegar a id_usuario
    hay que consultar la tabla Usuario por id_persona
    (ver usuario_service.obtener_por_id_persona).
"""

EMAIL_POR_ID_PERSONA = {
    1: "admin@test.com",
    2: "alumno@test.com",
    3: "docente@test.com",
    4: "pendiente@test.com",
}


def obtener_id_persona_por_email(email):
    """Devuelve el id_persona asociado a un email, o None si no existe."""
    if not email:
        return None
    email_normalizado = email.strip().lower()
    for id_persona, correo in EMAIL_POR_ID_PERSONA.items():
        if correo.lower() == email_normalizado:
            return id_persona
    return None


def obtener_email_por_id_persona(id_persona):
    """Devuelve el email asociado a un id_persona, o None si no existe."""
    return EMAIL_POR_ID_PERSONA.get(id_persona)


def registrar_persona(id_persona, email):
    """Registra (o actualiza) el email de una persona en el mock.

    Se llama al crear un usuario nuevo (ver usuario_service.crear_completo)
    para que el email quede disponible en login/activación/recuperación sin
    tener que editar este archivo a mano cada vez.
    """
    if not id_persona or not email:
        return
    EMAIL_POR_ID_PERSONA[id_persona] = email.strip().lower()