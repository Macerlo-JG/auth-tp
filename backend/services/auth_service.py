"""
Lógica de negocio de autenticación.

Responsabilidades:
- Validar credenciales y estado del usuario.
- Crear, renovar y cerrar sesiones en Redis.
- Obtener roles y acciones vigentes desde la DB.

No genera tokens JWT: eso es responsabilidad del endpoint (blueprints/auth_bp.py),
que tiene acceso al contexto de Flask-JWT-Extended.
"""

from datetime import datetime
from models.usuario import EstadoUsuario, Usuario
from models.credencial_model import Credencial
from services.credencial_service import verificar_password
from services.cliente_planes import obtener_email_por_id_persona
from auth_common.sesion_common import obtener_sesion
from services import sesion_service
from models.rol_usuario import RolUsuario
from models.rol_accion import RolAccion


# ---------------------------------------------------------------------------
# Roles y acciones
# ---------------------------------------------------------------------------

def obtener_roles_y_acciones(id_usuario):
    """
    Devuelve (roles, acciones) para el usuario, ambos como listas de strings
    ordenadas y sin duplicados.

    - roles:   nombres de los roles activos asignados al usuario.
    - acciones: identificadores "servicio.nombre" de las acciones habilitadas
                para esos roles.
    """
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

    ids_roles = [
        asignacion.id_rol 
        for asignacion in asignaciones 
        if asignacion.rol.activo
    ]

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


# ---------------------------------------------------------------------------
# Sesión
# ---------------------------------------------------------------------------

def crear_sesion_usuario(id_usuario, id_persona, refresh_jti):
    roles, acciones = obtener_roles_y_acciones(id_usuario)

    sesion_service.crear_sesion(
        id_usuario=id_usuario,
        roles=roles,
        acciones=acciones,
        refresh_jti=refresh_jti,
        id_persona=id_persona,
    )

    return roles, acciones


def cerrar_sesion_usuario(id_usuario):
    sesion_service.eliminar_sesion(id_usuario)


def renovar_sesion_usuario(id_usuario, refresh_jti_recibido):
    """
    Devuelve uno de tres motivos:
      "ok"          — sesión renovada correctamente.
      "no_existe"   — no hay sesión activa (venció por TTL o se cerró).
      "jti_invalido"— hay sesión, pero el refresh token no coincide.
    """
    sesion = obtener_sesion(id_usuario)

    if not sesion:
        return "no_existe"

    if sesion["refresh_jti"] != refresh_jti_recibido:
        return "jti_invalido"

    sesion_service.renovar_sesion(id_usuario)
    return "ok"

# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

    # Verifico si la contra tiene más de 30 días
    # Retorno True si debe mostrar el aviso

def verificar_aviso_cambio_contrasena(id_usuario):
    """Verifico si la contraseña actual tiene más de 30 días.
    Retorno True si debe mostrarse el aviso.
    """
    credencial = Credencial.query.filter_by(
        id_usuario=id_usuario,
        es_actual=True,
        activo=True,
    ).first()

    if not credencial or not credencial.created_at:
        return False

    dias_desde_creacion = (datetime.now(credencial.created_at.tzinfo) - credencial.created_at).days
    return dias_desde_creacion > 30


def login(id_persona, password):
    """
    Valida credenciales y estado del usuario. No genera tokens.

    Devuelve el objeto Usuario si todo es válido.
    Lanza ValueError para errores que deben responderse con 401.
    Lanza CuentaPendienteError si la cuenta existe pero no fue activada.
    """
    usuario = Usuario.query.filter_by(id_persona=id_persona, activo=True).first()

    if not usuario:
        raise ValueError("Credenciales inválidas.")

    if usuario.estado_usuario == EstadoUsuario.BLOQUEADO:
        raise ValueError("Su cuenta está bloqueada. Contacte al administrador.")

    if usuario.estado_usuario == EstadoUsuario.INACTIVO:
        raise ValueError("Su cuenta está inactiva. Contacte al administrador.")

    if not verificar_password(usuario.id_usuario, password):
        raise ValueError("Credenciales inválidas.")

    # La verificación de PENDIENTE va después de verificar la contraseña:
    # no queremos confirmar que el email existe si la contraseña es incorrecta.
    if usuario.estado_usuario == EstadoUsuario.PENDIENTE:
        # Antes acá se usaba `usuario.email`, pero el modelo Usuario NO
        # guarda email.
        email = obtener_email_por_id_persona(usuario.id_persona)
        raise CuentaPendienteError(
            "Su cuenta aún no fue confirmada. Revise su correo e ingrese el código de activación.",
            id_usuario=usuario.id_usuario,
            email=email,
        )

    return usuario


def propagar_cambio_roles(id_usuario):
    """
    Recalcula los roles/acciones vigentes de id_usuario y, si tiene una
    sesión activa en Redis, la sobrescribe.

    Si el usuario no tiene sesión activa, actualizar_permisos_sesion no
    hace nada - el estado nuevo se arma solo, desde PostgreSQL, en su
    próximo login.
    """
    roles, acciones = obtener_roles_y_acciones(id_usuario)
    sesion_service.actualizar_permisos_sesion(id_usuario, roles, acciones)


# ---------------------------------------------------------------------------
# Errores
# ---------------------------------------------------------------------------

class CuentaPendienteError(Exception):
    """Cuenta que existe y tiene contraseña válida pero no fue activada."""

    def __init__(self, message, id_usuario=None, email=None):
        super().__init__(message)
        self.id_usuario = id_usuario
        self.email = email