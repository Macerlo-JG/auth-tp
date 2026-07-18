from models.usuario import Usuario, EstadoUsuario
from schemas.usuario_schemas import usuario_create_schema, usuario_update_schema
from db import db
from services.credencial_service import crear_password_temporal
from services.email_service import enviar_bienvenida
from mock.emails_usuario import EMAIL_POR_ID_USUARIO

"""Servicio de usuarios.

Contiene funciones para crear, actualizar y activar usuarios, así como
un flujo completo de creación que también genera credenciales temporales
y envía el correo de bienvenida.
"""

def obtener_todos():
    return Usuario.query.filter_by(activo=True).all()

def obtener_por_id(id_usuario):
    return Usuario.query.filter_by(
        id_usuario=id_usuario,
        activo=True
    ).first()

def crear(datos):
    nuevo = usuario_create_schema.load(datos)

    db.session.add(nuevo)
    db.session.commit()

    return nuevo

def actualizar(usuario, datos):
    usuario_update_schema.load(datos, instance=usuario, partial=True)
    db.session.commit()
    return usuario

def eliminar(usuario):
    usuario.activo = False
    db.session.commit()


def activar_cuenta(usuario):
    usuario.estado_usuario = EstadoUsuario.ACTIVO
    db.session.commit()
    return usuario


# Creo Usuario + Contraseña temporal + Mail de bienvenida.
# ahora mismo el mail solo se usa para el envio de correo y login, no hay persistencia real
# porque usamos mocks.
def crear_completo(datos):
    
    email = datos.pop("email", None)
    if not email or not str(email).strip():
        raise ValueError("El email es requerido para enviar las credenciales")

    email = str(email).strip().lower()
    created_by = datos.get("created_by")

    nuevo = usuario_create_schema.load(datos)
    db.session.add(nuevo)
    db.session.flush()

    password_temporal = crear_password_temporal(nuevo.id_usuario, created_by)

    # MOCK: registramos el email para login.
    # Agregar acá también en frontend/src/api/auth.js → USUARIOS_MOCK.
    # Lo estamos agregando al archivo "emails_usuario.py", en su correspondiente diccionario, para poder usarlo a futuro
    # sin tener que almacenar en la base de datos.
    EMAIL_POR_ID_USUARIO[nuevo.id_usuario] = email

    link_activacion = f"http://localhost:5173/activar-cuenta?email={email}"
    # Enviamos "mail" que por ahora se envía por consola.
    enviar_bienvenida(email, password_temporal, link_activacion)


    # Devuelvo usuario nuevo y contra temporal.
    return nuevo, password_temporal