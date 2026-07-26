from db import db
from models.accion import Accion
from models.rol import Rol
from models.rol_accion import RolAccion
from schemas.registro_acciones_schemas import registro_acciones_schema

"""
Registra acciones, roles y relaciones rol-acción declaradas por un
microservicio (vía POST /acciones) o por Auth mismo (sin pasar por HTTP).

Se procesan acciones, roles, y roles_acciones en ese orden, porque
rol_accion depende de que las acciones y los roles ya existan.

Los conflictos no cortan el registro completo: se acumulan y se
devuelven en la respuesta, el resto del payload se procesa igual.
"""


def registrar_acciones(datos):
    datos = registro_acciones_schema.load(datos)
    servicio = datos["servicio"]
    conflictos = []

    for accion_datos in datos["acciones"]:
        guardar_accion(servicio, accion_datos)

    for rol_datos in datos["roles"]:
        guardar_rol(rol_datos)

    # Los roles y acciones recién creados arriba todavía no tienen id_rol/id_accion 
    # asignado hasta que la sesión los persista.
    db.session.flush()

    for relacion in datos["rol_accion"]:
        conflictos.extend(
            guardar_rol_accion(servicio, relacion["rol"], relacion["acciones"])
        )

    db.session.commit()

    return conflictos


def guardar_accion(servicio, accion_datos):
    accion = Accion.query.filter_by(servicio=servicio, nombre=accion_datos["nombre"]).first()

    if accion is None:
        accion = Accion(
            servicio=servicio,
            nombre=accion_datos["nombre"],
            created_by=1,
        )
        db.session.add(accion)

    accion.descripcion = accion_datos["descripcion"]
    accion.activo = accion_datos["activo"]


def guardar_rol(rol_datos):
    rol = Rol.query.filter_by(nombre=rol_datos["nombre"]).first()

    if rol is None:
        rol = Rol(
            nombre=rol_datos["nombre"],
            descripcion=rol_datos["descripcion"],
            created_by=1,
        )
        db.session.add(rol)
        return

    rol.descripcion = rol_datos["descripcion"]


def guardar_rol_accion(servicio, nombre_rol, nombres_acciones):
    rol = Rol.query.filter_by(nombre=nombre_rol).first()

    if rol is None:
        return [{"tipo": "rol_accion", "rol": nombre_rol, "motivo": "el rol no existe"}]

    conflictos = []
    acciones_nuevas = set(nombres_acciones)

    relaciones_actuales = (
        RolAccion.query
        .join(Accion)
        .filter(RolAccion.id_rol == rol.id_rol, Accion.servicio == servicio)
        .all()
    )
    nombres_actuales = {relacion.accion.nombre for relacion in relaciones_actuales}

    for relacion in relaciones_actuales:
        relacion.activo = relacion.accion.nombre in acciones_nuevas

    for nombre_accion in acciones_nuevas:
        # Si ya existe una relación con esta acción (activa o no), el loop
        # de arriba ya se encargó de dejarla en el estado correcto, acá
        # sólo faltan las que son de un vínculo nuevo.
        if nombre_accion in nombres_actuales:
            continue

        accion = Accion.query.filter_by(servicio=servicio, nombre=nombre_accion).first()

        if accion is None:
            conflictos.append({
                "tipo": "rol_accion",
                "rol": nombre_rol,
                "motivo": f"la acción {nombre_accion} no existe",
            })
            continue

        db.session.add(RolAccion(id_rol=rol.id_rol, id_accion=accion.id_accion, created_by=1))

    return conflictos