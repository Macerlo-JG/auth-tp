from db import db
from models.usuario import (
    Usuario,
    EstadoUsuario
)
from models.rol import Rol
from models.rol_usuario import RolUsuario

def seed_data():
    # Evita insertar datos si ya existen
    if Rol.query.first():
        return

    # Roles

    admin = Rol(
        nombre="ADMINISTRADOR",
        descripcion="Administrador del sistema",
        created_by=1
    )

    alumno = Rol(
        nombre="ALUMNO",
        descripcion="Alumno de la institución",
        created_by=1
    )

    docente = Rol(
        nombre="DOCENTE",
        descripcion="Docente de la institución",
        created_by=1
    )

    auditor = Rol(
        nombre="AUDITOR",
        descripcion="Auditor del sistema",
        created_by=1
    )

    gestion = Rol(
        nombre="GESTIÓN ACADÉMICA",
        descripcion="Personal de gestión académica",
        created_by=1
    )

    db.session.add_all([
        admin,
        alumno,
        docente,
        auditor,
        gestion
    ])

    db.session.flush()

    # Usuarios

    usuario1 = Usuario(
        id_persona=1,
        estado_usuario=EstadoUsuario.ACTIVO,
        created_by=1
    )

    usuario2 = Usuario(
        id_persona=2,
        estado_usuario=EstadoUsuario.ACTIVO,
        created_by=1
    )

    usuario3 = Usuario(
        id_persona=3,
        estado_usuario=EstadoUsuario.ACTIVO,
        created_by=1
    )

    usuario4 = Usuario(
        id_persona=4,
        estado_usuario=EstadoUsuario.PENDIENTE,
        created_by=1
    )

    usuario5 = Usuario(
        id_persona=5,
        estado_usuario=EstadoUsuario.BLOQUEADO,
        created_by=1
    )

    db.session.add_all([
        usuario1,
        usuario2,
        usuario3,
        usuario4,
        usuario5
    ])

    db.session.flush()

    # Asignación de roles

    db.session.add_all([
        # Usuario administrador
        RolUsuario(
            id_usuario=usuario1.id_usuario,
            id_rol=admin.id_rol,
            created_by=1
        ),

        # Alumno
        RolUsuario(
            id_usuario=usuario2.id_usuario,
            id_rol=alumno.id_rol,
            created_by=1
        ),

        # Docente
        RolUsuario(
            id_usuario=usuario3.id_usuario,
            id_rol=docente.id_rol,
            created_by=1
        ),

        # Docente + Gestión Académica
        RolUsuario(
            id_usuario=usuario3.id_usuario,
            id_rol=gestion.id_rol,
            created_by=1
        ),

        # Auditor
        RolUsuario(
            id_usuario=usuario5.id_usuario,
            id_rol=auditor.id_rol,
            created_by=1
        )
    ])

    db.session.commit()