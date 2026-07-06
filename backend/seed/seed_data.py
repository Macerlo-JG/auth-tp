from datetime import datetime, timezone

from db import db
from models.usuario import (
    Usuario,
    EstadoUsuario
)
from models.rol import Rol
from models.rol_usuario import RolUsuario

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