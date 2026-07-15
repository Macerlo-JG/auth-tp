from datetime import datetime, timezone

from db import db
from models.usuario import (
    Usuario,
    EstadoUsuario
)
from models.rol import Rol
from models.rol_usuario import RolUsuario
from models.accion import Accion
from models.rol_accion import RolAccion
from werkzeug.security import generate_password_hash
from models.credencial_model import Credencial

def seed_data():
    ahora = datetime.now(timezone.utc)

    # Creo los roles solo si no existen. checkea, guarda en una array, y si hay contenido en el array hace un "agregar todos" y flushea
    # Se indexan por nombre para poder chequear existencia.
    roles_existentes = {rol.nombre: rol for rol in Rol.query.all()}
    roles_a_crear = []
    if "ADMINISTRADOR" not in roles_existentes:
        roles_a_crear.append(Rol(nombre="ADMINISTRADOR", descripcion="Administrador del sistema", created_by=1, created_at=ahora))
    if "ALUMNO" not in roles_existentes:
        roles_a_crear.append(Rol(nombre="ALUMNO", descripcion="Alumno de la institución", created_by=1, created_at=ahora))
    if "DOCENTE" not in roles_existentes:
        roles_a_crear.append(Rol(nombre="DOCENTE", descripcion="Docente de la institución", created_by=1, created_at=ahora))
    if "AUDITOR" not in roles_existentes:
        roles_a_crear.append(Rol(nombre="AUDITOR", descripcion="Auditor del sistema", created_by=1, created_at=ahora))
    if "GESTIÓN ACADÉMICA" not in roles_existentes:
        roles_a_crear.append(Rol(nombre="GESTIÓN ACADÉMICA", descripcion="Personal de gestión académica", created_by=1, created_at=ahora))

    if roles_a_crear:
        db.session.add_all(roles_a_crear)
        # flush para asignar id para guardar registro sin confirmarlo.
        db.session.flush()

    # Se vuelve a leer de la bdd para tener roles ya existentes y los recién creados, todos con id_rol asignado.
    roles = {rol.nombre: rol for rol in Rol.query.all()}

    # Creo las acciones solo si no existen. Se indexan por (servicio, nombre),
    # que es la combinación que garantiza unicidad.
    acciones_existentes = {(a.servicio, a.nombre): a for a in Accion.query.all()}
    acciones_a_crear = []
    definicion_acciones = [
        ("auth", "usuarios.ver", "Ver listado y detalle de usuarios"),
        ("auth", "usuarios.control_parcial", "Crear nuevos usuarios"),
        ("auth", "roles.asignar", "Asignar o revocar roles de un usuario"),
    ]
    for servicio, nombre, descripcion in definicion_acciones:
        if (servicio, nombre) not in acciones_existentes:
            acciones_a_crear.append(
                Accion(servicio=servicio, nombre=nombre, descripcion=descripcion, created_by=1, created_at=ahora)
            )

    if acciones_a_crear:
        db.session.add_all(acciones_a_crear)
        db.session.flush()

    acciones = {(a.servicio, a.nombre): a for a in Accion.query.all()}

    # Asignación de acciones a roles: mismo patrón que las relaciones rol-usuario más abajo.
    # ADMINISTRADOR tiene las tres; GESTIÓN ACADÉMICA puede ver y editar; DOCENTE y AUDITOR solo ven.
    # ALUMNO queda sin ninguna acción asignada (caso de prueba: rol sin acciones).
    permisos_por_rol = {
        "ADMINISTRADOR": [("auth", "usuarios.ver"), ("auth", "usuarios.control_parcial"), ("auth", "roles.asignar")],
        "GESTIÓN ACADÉMICA": [("auth", "usuarios.ver"), ("auth", "usuarios.control_parcial")],
        "DOCENTE": [("auth", "usuarios.ver")],
        "AUDITOR": [("auth", "usuarios.ver")],
    }

    roles_acciones_a_crear = []
    for nombre_rol, claves_acciones in permisos_por_rol.items():
        for clave_accion in claves_acciones:
            if not RolAccion.query.filter_by(id_rol=roles[nombre_rol].id_rol, id_accion=acciones[clave_accion].id_accion).first():
                roles_acciones_a_crear.append(
                    RolAccion(id_rol=roles[nombre_rol].id_rol, id_accion=acciones[clave_accion].id_accion, created_by=1, created_at=ahora)
                )

    if roles_acciones_a_crear:
        db.session.add_all(roles_acciones_a_crear)

    # crear usuarios como datos MOCK en base si no existen
    # checkea, guarda en una array, y si hay contenido en el array hace un "agregar todos" y flushea
    # Mismo patrón que con roles: dict indexado por clave natural (id_persona)
    # para chequear existencia antes de insertar.
    usuarios_existentes = {usuario.id_persona: usuario for usuario in Usuario.query.all()}
    usuarios_a_crear = []
    if 1 not in usuarios_existentes:
        usuarios_a_crear.append(Usuario(id_persona=1, estado_usuario=EstadoUsuario.ACTIVO, created_by=1, created_at=ahora))
    if 2 not in usuarios_existentes:
        usuarios_a_crear.append(Usuario(id_persona=2, estado_usuario=EstadoUsuario.ACTIVO, created_by=1, created_at=ahora))
    if 3 not in usuarios_existentes:
        usuarios_a_crear.append(Usuario(id_persona=3, estado_usuario=EstadoUsuario.ACTIVO, created_by=1, created_at=ahora))
    if 4 not in usuarios_existentes:
        usuarios_a_crear.append(Usuario(id_persona=4, estado_usuario=EstadoUsuario.PENDIENTE, created_by=1, created_at=ahora))
    if 5 not in usuarios_existentes:
        usuarios_a_crear.append(Usuario(id_persona=5, estado_usuario=EstadoUsuario.BLOQUEADO, created_by=1, created_at=ahora))

    if usuarios_a_crear:
        db.session.add_all(usuarios_a_crear)
        db.session.flush()

    usuarios = {usuario.id_persona: usuario for usuario in Usuario.query.all()}
    
# Escenario de prueba: usuario 1 password correcta, usuario 2 password distinta, usuario 3 sin credencial.
    credenciales_existentes = {c.id_usuario for c in Credencial.query.all()}
    credenciales_a_crear = []

    passwords_test = {1: "123456", 2: "shiraoki123"}

    for id_persona, password_plano in passwords_test.items():
        usuario = usuarios.get(id_persona)
        if usuario and usuario.id_usuario not in credenciales_existentes:
            credenciales_a_crear.append(
                Credencial(
                    id_usuario=usuario.id_usuario,
                    password_hash=generate_password_hash(password_plano),
                    created_by=1,
                    created_at=ahora
                )
            )

    if credenciales_a_crear:
        db.session.add_all(credenciales_a_crear)


    # Asignación de roles a usuarios: antes de cada insert se chequea si la relación ya existe en DB,
    # para que correr seed_data() varias veces sea idempotente.
    relaciones = []
    if not RolUsuario.query.filter_by(id_usuario=usuarios[1].id_usuario, id_rol=roles["ADMINISTRADOR"].id_rol).first():
        relaciones.append(RolUsuario(id_usuario=usuarios[1].id_usuario, id_rol=roles["ADMINISTRADOR"].id_rol, created_by=1, created_at=ahora))
    if not RolUsuario.query.filter_by(id_usuario=usuarios[2].id_usuario, id_rol=roles["ALUMNO"].id_rol).first():
        relaciones.append(RolUsuario(id_usuario=usuarios[2].id_usuario, id_rol=roles["ALUMNO"].id_rol, created_by=1, created_at=ahora))
    if not RolUsuario.query.filter_by(id_usuario=usuarios[3].id_usuario, id_rol=roles["DOCENTE"].id_rol).first():
        relaciones.append(RolUsuario(id_usuario=usuarios[3].id_usuario, id_rol=roles["DOCENTE"].id_rol, created_by=1, created_at=ahora))
    if not RolUsuario.query.filter_by(id_usuario=usuarios[3].id_usuario, id_rol=roles["GESTIÓN ACADÉMICA"].id_rol).first():
        # Usuario 3 termina con DOS roles (DOCENTE + GESTIÓN ACADÉMICA).
        relaciones.append(RolUsuario(id_usuario=usuarios[3].id_usuario, id_rol=roles["GESTIÓN ACADÉMICA"].id_rol, created_by=1, created_at=ahora))
    if not RolUsuario.query.filter_by(id_usuario=usuarios[5].id_usuario, id_rol=roles["AUDITOR"].id_rol).first():
        relaciones.append(RolUsuario(id_usuario=usuarios[5].id_usuario, id_rol=roles["AUDITOR"].id_rol, created_by=1, created_at=ahora))
        # Nota: usuario 4 (PENDIENTE) queda sin ningún rol asignado

    if relaciones:
        db.session.add_all(relaciones)

    # Un solo commit al final para todo el seed (roles + usuarios + relaciones).
    db.session.commit()