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

def crear(datos, id_usuario_sesion):
    nuevo = usuario_create_schema.load(datos)

    nuevo.created_by = id_usuario_sesion

    db.session.add(nuevo)
    db.session.commit()

    return nuevo

def actualizar(usuario, datos, id_usuario_sesion):
    usuario_update_schema.load(datos, instance=usuario, partial=True)

    usuario.updated_by = id_usuario_sesion

    db.session.commit()
    return usuario

def eliminar(usuario, id_usuario_sesion):
    usuario.activo = False
    usuario.updated_by = id_usuario_sesion
    db.session.commit()

# Creo Usuario + Contraseña temporal + Mail de bienvenida.
def crear_completo(datos, id_usuario_sesion):
    email = datos.pop("email", None)
    if not email or not str(email).strip():
        raise ValueError("El email es requerido para enviar las credenciales")
    email = str(email).strip().lower()

    nuevo = usuario_create_schema.load(datos)
    nuevo.created_by = id_usuario_sesion
    db.session.add(nuevo)
    db.session.flush()

    password_temporal = crear_password_temporal(nuevo.id_usuario, id_usuario_sesion)
    EMAIL_POR_ID_USUARIO[nuevo.id_usuario] = email
    link_activacion = f"http://localhost:5173/activar-cuenta?email={email}"
    enviar_bienvenida(email, password_temporal, link_activacion)

    return nuevo, password_temporal


def activar_cuenta(usuario, id_usuario_sesion=None):
    usuario.estado_usuario = EstadoUsuario.ACTIVO
    usuario.updated_by = id_usuario_sesion if id_usuario_sesion is not None else usuario.id_usuario
    db.session.commit()
    return usuario