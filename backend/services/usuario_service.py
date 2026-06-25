from models.usuario import Usuario
from schemas.usuario_schema import usuario_create_schema, usuario_update_schema
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