from datetime import datetime, timezone

import yaml

from db import db
from models.usuario import (
    Usuario,
    EstadoUsuario
)
from models.rol import Rol
from models.rol_usuario import RolUsuario
from werkzeug.security import generate_password_hash
from models.credencial_model import Credencial
from services.acciones_service import registrar_acciones
from services.rol_service import NOMBRE_ROL_SUPERADMIN


def cargar_acciones_yml(ruta="acciones.yml"):
    with open(ruta, encoding="utf-8") as archivo:
        return yaml.safe_load(archivo)


def seed_data():
    """
    Seed mínimo para que el sistema pueda arrancar y ser administrado:
    catálogo de roles, acciones registradas desde acciones.yml, y un
    único usuario administrador para poder loguearse la primera vez.

    A propósito NO crea usuarios de prueba adicionales (alumno, docente,
    auditor, etc.). Si hacen falta usuarios de prueba para desarrollo,
    conviene un script de seed aparte, no este.

    Idempotente: correrlo varias veces no duplica roles, acciones ni
    el usuario admin (cada bloque chequea existencia antes de insertar).
    """
    ahora = datetime.now(timezone.utc)

    # ------------------------------------------------------------------
    # Catálogo de roles del sistema.
    # Se crean todos los roles conocidos aunque, por ahora, solo
    # ADMINISTRADOR (y SUPERADMIN) tengan un usuario asignado. El resto
    # queda disponible para asignarse desde la app una vez que existan
    # usuarios reales.
    # Se indexan por nombre para chequear existencia antes de insertar.
    # ------------------------------------------------------------------
    roles_existentes = {rol.nombre: rol for rol in Rol.query.all()}
    roles_a_crear = []

    if "ADMINISTRADOR" not in roles_existentes:
        roles_a_crear.append(
            Rol(nombre="ADMINISTRADOR", descripcion="Administrador del sistema", created_by=1, created_at=ahora)
        )
    if "ALUMNO" not in roles_existentes:
        roles_a_crear.append(
            Rol(nombre="ALUMNO", descripcion="Alumno de la institución", created_by=1, created_at=ahora)
        )
    if "DOCENTE" not in roles_existentes:
        roles_a_crear.append(
            Rol(nombre="DOCENTE", descripcion="Docente de la institución", created_by=1, created_at=ahora)
        )
    if "AUDITOR" not in roles_existentes:
        roles_a_crear.append(
            Rol(nombre="AUDITOR", descripcion="Auditor del sistema", created_by=1, created_at=ahora)
        )
    if "GESTIÓN ACADÉMICA" not in roles_existentes:
        roles_a_crear.append(
            Rol(nombre="GESTIÓN ACADÉMICA", descripcion="Personal de gestión académica", created_by=1, created_at=ahora)
        )
    if NOMBRE_ROL_SUPERADMIN not in roles_existentes:
        roles_a_crear.append(
            Rol(
                nombre=NOMBRE_ROL_SUPERADMIN,
                descripcion="Acceso total a todas las acciones de todos los microservicios - para que los demás equipos prueben contra Auth sin gestionar permisos finos",
                created_by=1,
                created_at=ahora,
            )
        )

    if roles_a_crear:
        db.session.add_all(roles_a_crear)
        # flush (no commit) para que los roles recién creados ya tengan
        # id_rol asignado y se puedan referenciar más abajo.
        db.session.flush()

    # Se vuelve a leer de la base para tener tanto los roles preexistentes
    # como los recién creados, todos con id_rol asignado.
    roles = {rol.nombre: rol for rol in Rol.query.all()}

    # ------------------------------------------------------------------
    # Acciones: se registran a través del mismo mecanismo que usa
    # POST /acciones (llamada directa a la función, sin pasar por HTTP),
    # con el payload leído de acciones.yml. Esto también dispara la
    # resincronización de SUPERADMIN (ver acciones_service.py).
    # ------------------------------------------------------------------
    registrar_acciones(cargar_acciones_yml())

    # ------------------------------------------------------------------
    # Usuario administrador único (id_persona = 1).
    # Es el único usuario que crea el seed: sin esto no habría forma de
    # loguearse la primera vez que se levanta el sistema.
    # ------------------------------------------------------------------
    admin = Usuario.query.filter_by(id_persona=1).first()

    if not admin:
        admin = Usuario(
            id_persona=1,
            estado_usuario=EstadoUsuario.ACTIVO,
            created_by=1,
            created_at=ahora,
        )
        db.session.add(admin)
        db.session.flush()  # para tener id_usuario antes de crear la credencial

    # Credencial del admin, solo si todavía no tiene una.
    #
    # ATENCIÓN: "123456" es una contraseña de arranque pensada para
    # desarrollo/primer login, no para un ambiente productivo real.
    # Si este seed corre contra un ambiente expuesto, cambiar la
    # contraseña del admin inmediatamente después del primer login
    # (POST /credenciales/cambiar).
    tiene_credencial = Credencial.query.filter_by(id_usuario=admin.id_usuario).first()

    if not tiene_credencial:
        db.session.add(
            Credencial(
                id_usuario=admin.id_usuario,
                password_hash=generate_password_hash("123456"),
                created_by=1,
                created_at=ahora,
                es_actual=True,
            )
        )

    # Rol ADMINISTRADOR asignado al usuario admin, si todavía no lo tiene.
    tiene_rol_admin = RolUsuario.query.filter_by(
        id_usuario=admin.id_usuario, id_rol=roles["ADMINISTRADOR"].id_rol
    ).first()

    if not tiene_rol_admin:
        db.session.add(
            RolUsuario(
                id_usuario=admin.id_usuario,
                id_rol=roles["ADMINISTRADOR"].id_rol,
                created_by=1,
                created_at=ahora,
            )
        )

    # Rol SUPERADMIN asignado al mismo usuario admin (segundo rol), si todavía no lo tiene. Sus acciones se completansolas vía _resincronizar_superadmin() en acciones_service.py, cada vez que cualquier microservicio (incluido Auth) registra las suyas.
    tiene_rol_superadmin = RolUsuario.query.filter_by(
        id_usuario=admin.id_usuario, id_rol=roles[NOMBRE_ROL_SUPERADMIN].id_rol
    ).first()

    if not tiene_rol_superadmin:
        db.session.add(
            RolUsuario(
                id_usuario=admin.id_usuario,
                id_rol=roles[NOMBRE_ROL_SUPERADMIN].id_rol,
                created_by=1,
                created_at=ahora,
            )
        )

    # Un solo commit al final para todo el seed (roles + acciones + admin).
    db.session.commit()