"""
Este archivo contiene la lógica de negocio de la sesión de usuario: arma
los datos de sesión a partir de la base de datos (roles y acciones
vigentes) y valida el refresh token contra la sesión guardada.
"""

from auth_common import sesion_common
from models.rol_usuario import RolUsuario
from models.rol_accion import RolAccion

def obtener_roles_y_acciones(id_usuario):
    # Roles activos del usuario (unión de todos los roles vigentes)
    asignaciones = (
        RolUsuario.query
        .filter_by(id_usuario=id_usuario, activo=True)
        .all()
    )

    roles = sorted({
        asignacion.rol.nombre
        for asignacion in asignaciones
        if asignacion.rol.activo
    })

    ids_roles = [asignacion.id_rol for asignacion in asignaciones]

    # Unión de las acciones de todos esos roles, sin duplicados.
    # El identificador que se guarda en Redis es "servicio.nombre" (ej.
    # "legajo.planes.crear"), armado a partir de las dos columnas de Accion.
    permisos = (
        RolAccion.query
        .filter(RolAccion.id_rol.in_(ids_roles), RolAccion.activo.is_(True))
        .all()
    )

    acciones = sorted({
        f"{permiso.accion.servicio}.{permiso.accion.nombre}"
        for permiso in permisos
        if permiso.accion.activo
    })

    return roles, acciones

def crear_sesion_usuario(id_usuario, id_persona, refresh_jti):
    roles, acciones = obtener_roles_y_acciones(id_usuario)

    sesion_common.crear_sesion(
        id_usuario=id_usuario,
        roles=roles,
        acciones=acciones,
        refresh_jti=refresh_jti,
        id_persona=id_persona,
    )

    return roles, acciones

def cerrar_sesion_usuario(id_usuario):
    sesion_common.eliminar_sesion(id_usuario)

def renovar_sesion_usuario(id_usuario, refresh_jti_recibido):
    """
    Devuelve un motivo en vez de un booleano, para que el endpoint /refresh pueda responder distinto en cada caso:
      "ok": se renovó correctamente
      "no_existe": no hay sesión (cerró sesión o se venció por TTL)
      "jti_invalido": hay sesión, pero el refresh token recibido no es el vigente
    """
    sesion = sesion_common.obtener_sesion(id_usuario)

    if not sesion:
        return "no_existe"

    # El refresh token recibido tiene que coincidir con el guardado en la sesión.
    if sesion["refresh_jti"] != refresh_jti_recibido:
        return "jti_invalido"

    sesion_common.renovar_sesion(id_usuario)
    return "ok"