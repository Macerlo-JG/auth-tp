from models.usuario import EstadoUsuario
from mock.emails_usuario import obtener_id_usuario_por_email, obtener_email
from services.usuario_service import obtener_por_id
from services.credencial_service import verificar_password
from services.rol_usuario_service import obtener_roles_usuario

# Mapear permisos según los roles asignados al usuario.
# Estos permisos se usan en el frontend para habilitar o bloquear acciones.
PERMISOS_POR_ROL = {
    "ADMINISTRADOR": [
        "usuarios.ver",
        "usuarios.crear",
        "usuarios.editar",
        "usuarios.eliminar",
        "roles.asignar",
    ],
    "ALUMNO": [
        "usuarios.ver",
        "usuarios.crear",
        "usuarios.editar",
    ],
    "DOCENTE": ["usuarios.ver"],
    "AUDITOR": ["usuarios.ver"],
    "GESTIÓN ACADÉMICA": [
        "usuarios.ver",
        "usuarios.crear",
        "usuarios.editar",
    ],
}


# Convierte la lista de roles del usuario en una lista de permisos. Por ahora hardcodeados.
def _calcular_permisos(roles):
    permisos = set()
    for rol in roles:
        for permiso in PERMISOS_POR_ROL.get(rol.nombre, []):
            permisos.add(permiso)
    return sorted(permisos)


def _nombre_usuario(id_usuario):
    """Retorna un nombre de usuario amigable para pantallas de login/mock."""
    nombres = {
        1: "Administrador",
        2: "Alumno",
        3: "Docente",
    }
    return nombres.get(id_usuario, f"Usuario {id_usuario}")

# Valida credenciales + MOCK
def login(email, password):
    
    # Se usa el diccionario de emails mock para buscar el id de usuario asociado.
    id_usuario = obtener_id_usuario_por_email(email)
    if not id_usuario:
        raise ValueError("Correo o contraseña incorrectos.")

    # Carga el usuario desde el servicio de usuarios.
    usuario = obtener_por_id(id_usuario)
    if not usuario:
        raise ValueError("Correo o contraseña incorrectos.")

    # Rechaza usuarios bloqueados o inactivos antes de comprobar contraseña.
    if usuario.estado_usuario == EstadoUsuario.BLOQUEADO:
        raise ValueError("Su cuenta está bloqueada. Contacte al administrador.")

    if usuario.estado_usuario == EstadoUsuario.INACTIVO:
        raise ValueError("Su cuenta está inactiva. Contacte al administrador.")

    # Verifica que la contraseña ingresada coincida con el hash activo.
    password_valida = verificar_password(id_usuario, password)
    if not password_valida:
        raise ValueError("Correo o contraseña incorrectos.")

    # Si la cuenta está pendiente, devolvemos un error especial para activar.
    if usuario.estado_usuario == EstadoUsuario.PENDIENTE:
        raise CuentaPendienteError(
            "Su cuenta aún no fue confirmada. Revise su correo e ingrese el código de activación.",
            id_usuario=id_usuario,
            email=email.strip().lower(),
        )

    roles = obtener_roles_usuario(id_usuario)
    permisos = _calcular_permisos(roles)

    # En este proyecto se usa un token mock en lugar de JWT real.
    return {
        "access_token": "MOCK_ACCESS_TOKEN",
        "refresh_token": "MOCK_REFRESH_TOKEN",
        "user": {
            "id": id_usuario,
            "nombre": _nombre_usuario(id_usuario),
            "email": obtener_email(id_usuario) or email.strip().lower(),
        },
        "roles": [{"id": rol.id_rol, "nombre": rol.nombre} for rol in roles],
        "permisos": permisos,
        "aviso_cambio_contrasena": True,
    }


class CuentaPendienteError(Exception):
    """Error específico para cuentas que aún no se activaron."""

    def __init__(self, message, id_usuario=None, email=None):
        super().__init__(message)
        self.id_usuario = id_usuario
        self.email = email
