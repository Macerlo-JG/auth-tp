from marshmallow import ValidationError
from db import db
from models.usuario import Usuario
from models.rol import Rol
from models.rol_usuario import RolUsuario
from schemas.rol_usuario_schemas import asignar_roles_schema, revocar_roles_schema
from services import auth_service

"""
Este archivo contiene la lógica de negocio para la asignación y
revocación de roles a usuarios.
"""

def obtener_roles_usuario(id_usuario):
    usuario = Usuario.query.filter_by(
        id_usuario=id_usuario,
        activo=True
    ).first()

    if not usuario:
        raise ValidationError({
            "id_usuario": [
                "El usuario no existe"
            ]
        })

    return [
        usuario_rol.rol
        for usuario_rol in usuario.roles_usuario
        if usuario_rol.activo
    ]

def asignar_roles(id_usuario, datos, id_usuario_sesion):
    # Valida la request utilizando el schema correspondiente
    datos = asignar_roles_schema.load(datos)

    # Verifica que el usuario exista y esté activo
    usuario = Usuario.query.filter_by(
        id_usuario=id_usuario,
        activo=True
    ).first()

    if not usuario:
        raise ValidationError({
            "id_usuario": [
                "El usuario no existe"
            ]
        })

    # Obtiene todos los roles solicitados que existen y están activos
    roles = (
        Rol.query
        .filter(
            Rol.id_rol.in_(datos["id_roles"]),
            Rol.activo.is_(True)
        )
        .all()
    )

    # Verifica que todos los ids recibidos correspondan a roles existentes
    ids_roles = [rol.id_rol for rol in roles]

    for id_rol in datos["id_roles"]:
        if id_rol not in ids_roles:
            raise ValidationError({
                "id_roles": [
                    f"El rol {id_rol} no existe"
                ]
            })

    # Verifica que el usuario no tenga previamente asignado alguno de los roles solicitados
    asignaciones_existentes = (
        RolUsuario.query
        .filter(
            RolUsuario.id_usuario == id_usuario,
            RolUsuario.id_rol.in_(datos["id_roles"]),
            RolUsuario.activo.is_(True)
        )
        .all()
    )

    ids_existentes = [ur.id_rol for ur in asignaciones_existentes]

    if ids_existentes:
        raise ValidationError({
            "id_roles": [
                f"El usuario ya posee los roles {sorted(ids_existentes)}"
            ]
        })

    # Crea las nuevas asignaciones usuario-rol.
    # created_by se deriva de la sesión autenticada (flask.g.id_usuario),
    # nunca del body.
    nuevas_asignaciones = [
        RolUsuario(
            id_usuario=id_usuario,
            id_rol=rol.id_rol,
            created_by=id_usuario_sesion
        )
        for rol in roles
    ]

    # Persiste todas las asignaciones en una única transacción
    db.session.add_all(nuevas_asignaciones)
    db.session.commit()

    # Si el usuario afectado tiene sesión activa en Redis, propaga el
    # cambio para que tenga efecto en su siguiente request.
    auth_service.propagar_cambio_roles(id_usuario)

    return nuevas_asignaciones

def revocar_rol(id_usuario, id_rol, id_usuario_sesion):

    # Verifica que el usuario exista y esté activo
    usuario = Usuario.query.filter_by(
        id_usuario=id_usuario,
        activo=True
    ).first()

    if not usuario:
        raise ValidationError({
            "id_usuario": [
                "El usuario no existe"
            ]
        })

    # Verifica que el rol exista
    rol = Rol.query.filter_by(id_rol=id_rol).first()

    if not rol:
        raise ValidationError({
            "id_rol": [
                "El rol no existe"
            ]
        })

    # Busca la asignación activa para ese par usuario-rol
    asignacion = (
        RolUsuario.query
        .filter_by(
            id_usuario=id_usuario,
            id_rol=id_rol,
            activo=True
        )
        .first()
    )

    if not asignacion:
        # Diferencia si la asignación nunca existió de si ya fue revocada
        ya_existio = (
            RolUsuario.query
            .filter_by(id_usuario=id_usuario, id_rol=id_rol)
            .first()
        )

        if ya_existio:
            raise ValidationError({
                "id_rol": [
                    "La asignación de este rol ya se encuentra revocada"
                ]
            })

        raise ValidationError({
            "id_rol": [
                "El usuario no posee este rol asignado"
            ]
        })

    asignacion.activo = False
    asignacion.updated_by = id_usuario_sesion
    db.session.commit()

    auth_service.propagar_cambio_roles(id_usuario)

    return asignacion


def revocar_roles(id_usuario, datos, id_usuario_sesion):
    # Valida la request
    datos = revocar_roles_schema.load(datos)

    # Verifica que el usuario exista y esté activo
    usuario = Usuario.query.filter_by(
        id_usuario=id_usuario,
        activo=True
    ).first()

    if not usuario:
        raise ValidationError({
            "id_usuario": [
                "El usuario no existe"
            ]
        })

    # Verifica que todos los roles solicitados existan
    roles = (
        Rol.query
        .filter(Rol.id_rol.in_(datos["id_roles"]))
        .all()
    )

    ids_roles = [rol.id_rol for rol in roles]

    for id_rol in datos["id_roles"]:
        if id_rol not in ids_roles:
            raise ValidationError({
                "id_roles": [
                    f"El rol {id_rol} no existe"
                ]
            })

    # Busca las asignaciones activas correspondientes a esos roles
    asignaciones = (
        RolUsuario.query
        .filter(
            RolUsuario.id_usuario == id_usuario,
            RolUsuario.id_rol.in_(datos["id_roles"]),
            RolUsuario.activo.is_(True)
        )
        .all()
    )

    ids_asignados = [asignacion.id_rol for asignacion in asignaciones]

    # Si alguno de los roles pedidos no tiene una asignación activa
    # (nunca se asignó o ya estaba revocado), no se procesa nada
    faltantes = [
        id_rol for id_rol in datos["id_roles"]
        if id_rol not in ids_asignados
    ]

    if faltantes:
        raise ValidationError({
            "id_roles": [
                f"El usuario no posee (o ya revocó) los roles {sorted(faltantes)}"
            ]
        })

    for asignacion in asignaciones:
        asignacion.activo = False
        asignacion.updated_by = id_usuario_sesion

    db.session.commit()

    auth_service.propagar_cambio_roles(id_usuario)

    return asignaciones