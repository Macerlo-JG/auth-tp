from marshmallow import ValidationError
from db import db
from models.rol import Rol
from models.accion import Accion
from models.rol_accion import RolAccion
from models.rol_usuario import RolUsuario
from schemas.rol_schemas import rol_create_schema, rol_update_schema
from services import auth_service

"""
Este archivo contiene la lógica de negocio del CRUD de Rol, incluida la
selección de acciones que se le vinculan (RolAccion).
"""


def obtener_todos(incluir_inactivos=False):
    """Si incluir_inactivos es True, trae también los roles dados de baja
    (para el admin, que los puede ver y reactivar)."""
    query = Rol.query
    if not incluir_inactivos:
        query = query.filter_by(activo=True)
    return query.all()


def obtener_por_id(id_rol):
    return Rol.query.filter_by(id_rol=id_rol, activo=True).first()


def obtener_por_id_cualquiera(id_rol):
    """Igual que obtener_por_id, pero también encuentra roles inactivos.
    Se usa para poder reactivarlos."""
    return Rol.query.filter_by(id_rol=id_rol).first()


def crear(datos, id_usuario_sesion):
    datos = rol_create_schema.load(datos)

    nuevo = Rol(
        nombre=datos["nombre"],
        descripcion=datos["descripcion"],
        created_by=id_usuario_sesion,
    )

    db.session.add(nuevo)

    # El rol recién agregado todavía no tiene id_rol asignado hasta que la
    # sesión lo persista.
    db.session.flush()

    sincronizar_acciones(nuevo, datos["id_acciones"], id_usuario_sesion)

    db.session.commit()

    # No hace falta propagar a Redis: un rol recién creado todavía no
    # tiene ningún usuario asignado.
    return nuevo


def actualizar(rol, datos, id_usuario_sesion):
    datos = rol_update_schema.load(datos)

    rol.descripcion = datos["descripcion"]
    rol.updated_by = id_usuario_sesion

    sincronizar_acciones(rol, datos["id_acciones"], id_usuario_sesion)

    db.session.commit()

    propagar_a_usuarios_del_rol(rol.id_rol)

    return rol


def eliminar(rol, id_usuario_sesion):
    rol.activo = False
    rol.updated_by = id_usuario_sesion

    db.session.commit()

    propagar_a_usuarios_del_rol(rol.id_rol)


def reactivar(rol, id_usuario_sesion):
    """Vuelve a activar un rol dado de baja."""
    rol.activo = True
    rol.updated_by = id_usuario_sesion

    db.session.commit()

    propagar_a_usuarios_del_rol(rol.id_rol)

    return rol


def sincronizar_acciones(rol, ids_acciones_nuevas, id_usuario_sesion):
    """
    Compara el set de RolAccion vigentes para este rol contra el set de
    id_accion recibido, y activa/desactiva/crea vínculos según
    corresponda. Nunca borra una fila de RolAccion, sólo la desactiva -
    mismo criterio que ya usa el flujo de acciones.yml.
    """
    ids_nuevos = set(ids_acciones_nuevas)

    if ids_nuevos:
        acciones_validas = (
            Accion.query
            .filter(Accion.id_accion.in_(ids_nuevos), Accion.activo.is_(True))
            .all()
        )
        ids_validos = {accion.id_accion for accion in acciones_validas}

        faltantes = []
        for id_accion in ids_nuevos:
            if id_accion not in ids_validos:
                faltantes.append(id_accion)

        if faltantes:
            raise ValidationError({
                "id_acciones": [
                    f"Las siguientes acciones no existen o no están activas: {sorted(faltantes)}"
                ]
            })

    relaciones_actuales = RolAccion.query.filter_by(id_rol=rol.id_rol).all()
    ids_actuales = {relacion.id_accion for relacion in relaciones_actuales}

    for relacion in relaciones_actuales:
        nuevo_estado = relacion.id_accion in ids_nuevos

        if relacion.activo != nuevo_estado:
            relacion.activo = nuevo_estado
            relacion.updated_by = id_usuario_sesion

    for id_accion in ids_nuevos:
        # Si ya existe una relación con esta acción (activa o no), el loop
        # de arriba ya se encargó de dejarla en el estado correcto, acá
        # sólo faltan las que son de un vínculo nuevo.
        if id_accion in ids_actuales:
            continue

        db.session.add(RolAccion(
            id_rol=rol.id_rol,
            id_accion=id_accion,
            created_by=id_usuario_sesion,
        ))


def propagar_a_usuarios_del_rol(id_rol):
    """
    Recalcula y sobrescribe la sesión de Redis de
    todos los usuarios que tengan este rol asignado y activo.
    """
    ids_usuarios = [
        asignacion.id_usuario
        for asignacion in RolUsuario.query.filter_by(id_rol=id_rol, activo=True).all()
    ]

    for id_usuario in ids_usuarios:
        auth_service.propagar_cambio_roles(id_usuario)