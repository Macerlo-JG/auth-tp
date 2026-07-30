from flask import current_app
from marshmallow import ValidationError
from models.usuario import Usuario, EstadoUsuario
from schemas.usuario_schemas import usuario_create_schema, usuario_update_schema, usuario_completo_con_roles_schema
from db import db
from services.credencial_service import crear_password_temporal
from services.email_service import enviar_bienvenida
from services.cliente_planes import obtener_email_por_id_persona
from models.rol import Rol
from models.rol_usuario import RolUsuario
from auth_common import sesion_common

"""Servicio de usuarios.

Contiene funciones para crear, actualizar y activar usuarios, así como
un flujo completo de creación que también genera credenciales temporales
y envía el correo de bienvenida.
"""

# Estados que, al ponerse, cierran la sesión activa del usuario al instante.
ESTADOS_QUE_REVOCAN_SESION = {EstadoUsuario.BLOQUEADO, EstadoUsuario.INACTIVO}


def obtener_todos():
    return Usuario.query.filter_by(activo=True).all()


def obtener_por_id(id_usuario):
    return Usuario.query.filter_by(id_usuario=id_usuario, activo=True).first()


def obtener_por_id_persona(id_persona):
    """Busca el usuario a partir de su id_persona (el dato "externo",
    ver mock/personas_mock.py). Lo usan activación y recuperación."""
    return Usuario.query.filter_by(id_persona=id_persona, activo=True).first()


def _es_administrador(id_usuario):
    """Dice si el usuario tiene el rol ADMINISTRADOR. Se usa para
    no dejar bloquear ni inactivar a un administrador."""
    return (
        RolUsuario.query
        .join(Rol, RolUsuario.id_rol == Rol.id_rol)
        .filter(
            RolUsuario.id_usuario == id_usuario,
            RolUsuario.activo.is_(True),
            Rol.nombre == "ADMINISTRADOR",
            Rol.activo.is_(True),
        )
        .first()
        is not None
    )


def _link_activacion(email):
    """Arma el link de activación a partir de FRONTEND_URL (config).

    Antes esto estaba hardcodeado a http://localhost:5173 en dos lugares
    distintos (crear_completo y crear_completo_con_roles). Ahora sale de
    app.config["FRONTEND_URL"], seteable por variable de entorno, con el
    mismo valor de localhost como default para no romper el dev actual
    si todavía no se define la variable.
    """
    base_url = current_app.config.get("FRONTEND_URL", "http://localhost:8480")
    # Evita "//" si alguien deja una barra final en la variable de entorno.
    base_url = base_url.rstrip("/")
    return f"{base_url}/auth/activar-cuenta?email={email}"


def crear(datos, id_usuario_sesion):
    nuevo = usuario_create_schema.load(datos)
    nuevo.created_by = id_usuario_sesion

    db.session.add(nuevo)
    db.session.commit()
    return nuevo


def actualizar(usuario, datos, id_usuario_sesion):
    estado_anterior = usuario.estado_usuario

    usuario_update_schema.load(datos, instance=usuario, partial=True)

    # Si se está intentando bloquear o inactivar, y el usuario es
    # administrador, se corta acá: un admin no se puede tocar así.
    intenta_restringir = (
        usuario.estado_usuario in ESTADOS_QUE_REVOCAN_SESION
        and usuario.estado_usuario != estado_anterior
    )
    if intenta_restringir and _es_administrador(usuario.id_usuario):
        db.session.rollback()
        raise ValueError("No se puede bloquear ni inactivar a un administrador")

    usuario.updated_by = id_usuario_sesion
    db.session.commit()

    # Si el nuevo estado es restrictivo, se cierra la sesión activa del
    # usuario para que no pueda seguir usando un token todavía válido.
    if intenta_restringir:
        sesion_common.eliminar_sesion(usuario.id_usuario)

    return usuario


def eliminar(usuario, id_usuario_sesion):
    usuario.activo = False
    usuario.updated_by = id_usuario_sesion
    db.session.commit()


def activar_cuenta(usuario, id_usuario_sesion=None):
    usuario.estado_usuario = EstadoUsuario.ACTIVO
    usuario.updated_by = id_usuario_sesion if id_usuario_sesion is not None else usuario.id_usuario
    db.session.commit()
    return usuario


def crear_completo(datos, id_usuario_sesion):
    """Crea un usuario, le genera una contraseña temporal y le manda
    el mail de bienvenida, todo en un solo paso."""
    datos.pop("email", None)

    nuevo = usuario_create_schema.load(datos)

    email = obtener_email_por_id_persona(nuevo.id_persona)
    if not email:
        raise ValueError("La persona indicada no tiene un email registrado en Planes")

    nuevo.created_by = id_usuario_sesion
    db.session.add(nuevo)
    db.session.flush()

    try:
        password_temporal = crear_password_temporal(nuevo.id_usuario, id_usuario_sesion)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    link_activacion = _link_activacion(email)
    enviar_bienvenida(email, password_temporal, link_activacion)

    return nuevo, password_temporal, email, link_activacion


def crear_completo_con_roles(datos, id_usuario_sesion):
    """
    Pensado para el microservicio Planes.
    Crea un usuario, le asigna una lista de roles y envía el mail de
    bienvenida.
    Los cuatro campos de entrada (id_persona, id_legajo, email, id_roles) se validan
    juntos, en un solo paso, con 'usuario_completo_con_roles_schema'.

    Los roles se validan antes de crear cualquier fila
    en la base. Si algún id_rol no existe (o no está activo), la función
    corta ahí sin haber creado el usuario ni la credencial.
    """

    # Validar email + id_roles. No son columnas de Usuario, por eso no
    #    pasan por usuario_create_schema.
    datos_validados = usuario_completo_con_roles_schema.load({
        "id_persona": datos.get("id_persona"),
        "id_legajo": datos.get("id_legajo"),
        "email": datos.get("email"),
        "id_roles": datos.get("id_roles"),
    })
    id_persona = datos_validados["id_persona"]
    id_legajo = datos_validados["id_legajo"]
    email = datos_validados["email"]
    id_roles = datos_validados["id_roles"]

    # Validar que todos los roles pedidos existan y estén activos.
    roles = (
        Rol.query
        .filter(Rol.id_rol.in_(id_roles), Rol.activo.is_(True))
        .all()
    )

    ids_encontrados = [rol.id_rol for rol in roles]
    faltantes = [id_rol for id_rol in id_roles if id_rol not in ids_encontrados]

    if faltantes:
        raise ValidationError({
            "id_roles": [f"Los roles {sorted(faltantes)} no existen o no están activos"]
        })

    # Crear el Usuario.
    nuevo = usuario_create_schema.load({"id_persona": id_persona})
    nuevo.created_by = id_usuario_sesion
    db.session.add(nuevo)
    db.session.flush()

    try:
        # Credencial temporal.
        password_temporal = crear_password_temporal(nuevo.id_usuario, id_usuario_sesion)

        # Asignaciones de rol.
        nuevas_asignaciones = [
            RolUsuario(id_usuario=nuevo.id_usuario, id_rol=rol.id_rol, created_by=id_usuario_sesion)
            for rol in roles
        ]
        db.session.add_all(nuevas_asignaciones)
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

    link_activacion = _link_activacion(email)
    enviar_bienvenida(email, password_temporal, link_activacion)

    return nuevo