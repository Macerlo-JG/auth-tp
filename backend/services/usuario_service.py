from marshmallow import ValidationError
from models.usuario import Usuario, EstadoUsuario
from schemas.usuario_schemas import usuario_create_schema, usuario_update_schema, usuario_completo_con_roles_schema
from db import db
from services.credencial_service import crear_password_temporal
from services.email_service import enviar_bienvenida
from mock.emails_usuario import registrar_persona
from models.rol import Rol
from models.rol_usuario import RolUsuario
from auth_common import sesion_common

"""Servicio de usuarios.

Contiene funciones para crear, actualizar y activar usuarios, así como
un flujo completo de creación que también genera credenciales temporales
y envía el correo de bienvenida.
"""

def obtener_todos():
    return Usuario.query.filter_by(activo=True).all()


def obtener_por_id(id_usuario):
    return Usuario.query.filter_by(id_usuario=id_usuario, activo=True).first()


def obtener_por_id_persona(id_persona):
    """Busca el usuario a partir de su id_persona (el dato "externo",
    ver mock/personas_mock.py). Lo usan activación y recuperación, que
    resuelven email -> id_persona a través del mock y necesitan llegar
    al Usuario real de la base.
    """
    return Usuario.query.filter_by(id_persona=id_persona, activo=True).first()


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


def activar_cuenta(usuario, id_usuario_sesion=None):
    usuario.estado_usuario = EstadoUsuario.ACTIVO
    usuario.updated_by = id_usuario_sesion if id_usuario_sesion is not None else usuario.id_usuario
    db.session.commit()
    return usuario


def crear_completo(datos, id_usuario_sesion):
    """Crea un usuario junto con su credencial temporal y envía el mail de bienvenida.

    Flujo:
      1. Cargar y agregar el usuario a la sesión (sin comitear todavía).
      2. flush() para que el usuario obtenga id_usuario sin cerrar la transacción,
         ya que crear_password_temporal necesita ese id para crear la credencial.
      3. Generar la credencial temporal (crear_password_temporal NO comitea
         internamente, ver credencial_service.py).
      4. Comitear usuario + credencial juntos, en una sola transacción atómica.
         Si algo falla en el paso 3, se hace rollback y no queda ni el usuario
         ni la credencial a medio crear.
      5. Recién después de tener todo persistido: registrar el email en el
         mock unificado de personas y enviar el mail de bienvenida.
    """
    email = datos.pop("email", None)
    if not email or not str(email).strip():
        raise ValueError("El email es requerido para enviar las credenciales")
    email = str(email).strip().lower()

    nuevo = usuario_create_schema.load(datos)
    nuevo.created_by = id_usuario_sesion
    db.session.add(nuevo)
    db.session.flush()  # asigna id_usuario sin comitear la transacción

    try:
        password_temporal = crear_password_temporal(nuevo.id_usuario, id_usuario_sesion)
        db.session.commit()  # confirma usuario + credencial en una sola transacción
    except Exception:
        db.session.rollback()  # deshace también el usuario "flusheado" arriba
        raise

    # Registramos la persona en el ÚNICO mock de email <-> id_persona.
    # Antes esto escribía en dos diccionarios separados (EMAIL_POR_ID_USUARIO
    # y EMAILS_MOCK) que quedaban desincronizados si alguien se olvidaba de
    # tocar uno de los dos -- fue la causa del bug de "pendiente@test.com".
    registrar_persona(nuevo.id_persona, email)

    link_activacion = f"http://localhost:5173/activar-cuenta?email={email}"

    # El mail se envía DESPUÉS del commit: si el commit falla, no se llega
    # a mandar un mail con credenciales de una cuenta que no existe.
    enviar_bienvenida(email, password_temporal, link_activacion)

    return nuevo, password_temporal

def crear_completo_con_roles(datos, id_usuario_sesion):
    """Crea un usuario, le asigna una lista de roles y envía el mail de
    bienvenida.

    Pensado para ser llamado por el microservicios Planes.

    Los tres campos de entrada (id_persona, email, id_roles) se validan
    juntos, en un solo paso, con 'usuario_completo_con_roles_schema'.

    Los roles se validan antes de crear cualquier fila
    en la base. Si algún id_rol no existe (o no está activo), la función
    corta ahí sin haber creado el usuario ni la credencial.
    """
    
    # Validar email + id_roles. No son columnas de Usuario, por eso no
    #    pasan por usuario_create_schema.
    datos_validados = usuario_completo_con_roles_schema.load({
        "id_persona": datos.get("id_persona"),
        "email": datos.get("email"),
        "id_roles": datos.get("id_roles"),
    })
    id_persona = datos_validados["id_persona"]
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
            "id_roles": [
                f"Los roles {sorted(faltantes)} no existen o no están activos"
            ]
        })

    # Crear el Usuario.
    nuevo = usuario_create_schema.load({"id_persona": id_persona})
    nuevo.created_by = id_usuario_sesion
    db.session.add(nuevo)
    db.session.flush()  # asigna id_usuario sin comitear la transacción

    try:
        # Credencial temporal.
        password_temporal = crear_password_temporal(nuevo.id_usuario, id_usuario_sesion)

        # Asignaciones de rol.
        nuevas_asignaciones = [
            RolUsuario(
                id_usuario=nuevo.id_usuario,
                id_rol=rol.id_rol,
                created_by=id_usuario_sesion
            )
            for rol in roles
        ]
        db.session.add_all(nuevas_asignaciones)

        db.session.commit()
    except Exception:
        db.session.rollback()
        raise
    
    link_activacion = f"http://localhost:5173/activar-cuenta?email={email}"
    enviar_bienvenida(email, password_temporal, link_activacion)

    return nuevo

ESTADOS_QUE_REVOCAN_SESION = {EstadoUsuario.BLOQUEADO, EstadoUsuario.INACTIVO}

def actualizar(usuario, datos, id_usuario_sesion):
    estado_anterior = usuario.estado_usuario

    usuario_update_schema.load(datos, instance=usuario, partial=True)
    usuario.updated_by = id_usuario_sesion

    db.session.commit()

    # Si el nuevo estado es restrictivo y cambió respecto al anterior,
    # se revoca la sesión activa (si existe) para que el usuario no pueda
    # seguir operando con un access token todavía válido.
    if (
        usuario.estado_usuario in ESTADOS_QUE_REVOCAN_SESION
        and usuario.estado_usuario != estado_anterior
    ):
        sesion_common.eliminar_sesion(usuario.id_usuario)

    return usuario