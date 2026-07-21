from models.usuario import Usuario
from schemas.usuario_schemas import usuario_create_schema, usuario_update_schema
from db import db

"""
Este archivo contiene la lógica de negocio del CRUD de usuario
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