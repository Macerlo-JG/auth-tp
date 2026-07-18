"""
Mapa de correos por id_usuario mockeados

La tabla usuarios no guarda email; este diccionario permite resolver el id_usuario para login, activación y recuperación.

Al crear un usuario nuevo, agregá acá la entrada con su id_usuario
y el mismo email que uses en frontend/src/api/auth.js (USUARIOS_MOCK).

Hecho con ia para facilitar el Testeo/desarrollo de AUTH.
"""

EMAIL_POR_ID_USUARIO = {
    1: "admin@test.com",
    2: "alumno@test.com",
    3: "docente@test.com",
    4: "pendiente@test.com",
}


def obtener_email(id_usuario):
    return EMAIL_POR_ID_USUARIO.get(id_usuario)


def obtener_id_usuario_por_email(email):
    if not email:
        return None
    email_normalizado = email.strip().lower()
    for id_usuario, correo in EMAIL_POR_ID_USUARIO.items():
        if correo.lower() == email_normalizado:
            return id_usuario
    return None
