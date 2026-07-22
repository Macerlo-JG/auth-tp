from models.usuario import Usuario, EstadoUsuario
from schemas.usuario_schemas import usuario_create_schema, usuario_update_schema
from db import db
from services.credencial_service import crear_password_temporal
from services.email_service import enviar_bienvenida
from mock.emails_usuario import registrar_persona

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