from db import ma
from marshmallow import fields, validate, validates, pre_load, ValidationError

"""
Schemas de validación para POST /acciones: el payload que cada microservicio
manda al arrancar (acciones.yml), con sus acciones, roles y las relaciones
rol-acción que declara.
"""

def normalizar_nombre_rol(nombre):
    # Mayúsculas + espacios colapsados.
    return " ".join(nombre.strip().upper().split())

def normalizar_minuscula(texto):
    # Minúsculas + espacios colapsados. Se usa para servicio y nombre de
    # acción, para que un mismo servicio/acción no termine duplicado en la base por una diferencia de mayúsculas entre dos registros.
    return " ".join(texto.strip().lower().split())

class AccionRegistroSchema(ma.Schema):
    nombre = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=100),
        error_messages={
            "required": "El nombre de la acción es obligatorio",
            "null": "El nombre de la acción no puede ser null"
        }
    )

    descripcion = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255),
        error_messages={
            "required": "La descripción de la acción es obligatoria",
            "null": "La descripción de la acción no puede ser null"
        }
    )

    activo = fields.Bool(
        required=True,
        error_messages={
            "required": "El campo activo es obligatorio",
            "null": "El campo activo no puede ser null"
        }
    )

    @pre_load
    def normalizar(self, datos, **kwargs):
        if isinstance(datos.get("nombre"), str):
            datos["nombre"] = normalizar_minuscula(datos["nombre"])
        return datos


class RolRegistroSchema(ma.Schema):
    nombre = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={
            "required": "El nombre del rol es obligatorio",
            "null": "El nombre del rol no puede ser null"
        }
    )

    descripcion = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255),
        error_messages={
            "required": "La descripción del rol es obligatoria",
            "null": "La descripción del rol no puede ser null"
        }
    )

    @pre_load
    def normalizar(self, datos, **kwargs):
        if isinstance(datos.get("nombre"), str):
            datos["nombre"] = normalizar_nombre_rol(datos["nombre"])
        return datos


class RolAccionRegistroSchema(ma.Schema):
    rol = fields.Str(
        required=True,
        error_messages={
            "required": "El nombre del rol es obligatorio",
            "null": "El nombre del rol no puede ser null"
        }
    )

    acciones = fields.List(
        fields.Str(),
        required=True,
        validate=validate.Length(
            min=1,
            error="Tiene que haber al menos una acción"
        ),
        error_messages={
            "required": "La lista de acciones es obligatoria",
            "null": "La lista de acciones no puede ser null"
        }
    )

    @pre_load
    def normalizar(self, datos, **kwargs):
        if isinstance(datos.get("rol"), str):
            datos["rol"] = normalizar_nombre_rol(datos["rol"])
        if isinstance(datos.get("acciones"), list):
            datos["acciones"] = [
                normalizar_minuscula(nombre) if isinstance(nombre, str) else nombre
                for nombre in datos["acciones"]
            ]
        return datos


class RegistroAccionesSchema(ma.Schema):
    servicio = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
        error_messages={
            "required": "El servicio es obligatorio",
            "null": "El servicio no puede ser null"
        }
    )

    acciones = fields.List(
        fields.Nested(AccionRegistroSchema),
        load_default=list
    )

    roles = fields.List(
        fields.Nested(RolRegistroSchema),
        load_default=list
    )

    rol_accion = fields.List(
        fields.Nested(RolAccionRegistroSchema),
        load_default=list
    )

    @pre_load
    def normalizar(self, datos, **kwargs):
        if isinstance(datos.get("servicio"), str):
            datos["servicio"] = normalizar_minuscula(datos["servicio"])
        return datos

    @validates("acciones")
    def validar_acciones_unicas(self, value, **kwargs):
        nombres = [accion.get("nombre") for accion in value if accion.get("nombre")]
        if len(nombres) != len(set(nombres)):
            raise ValidationError(
                "La lista de acciones contiene nombres duplicados"
            )

    @validates("roles")
    def validar_roles_unicos(self, value, **kwargs):
        nombres = [rol.get("nombre") for rol in value if rol.get("nombre")]
        if len(nombres) != len(set(nombres)):
            raise ValidationError(
                "La lista de roles contiene nombres duplicados"
            )

    @validates("rol_accion")
    def validar_rol_accion_sin_repetidos(self, value, **kwargs):
        roles = [relacion.get("rol") for relacion in value if relacion.get("rol")]
        if len(roles) != len(set(roles)):
            raise ValidationError(
                "El rol aparece más de una vez en rol_accion"
            )


registro_acciones_schema = RegistroAccionesSchema()