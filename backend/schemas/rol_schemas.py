from db import ma
from marshmallow import fields, validate, validates, validates_schema, pre_load, ValidationError
from models.rol import Rol
from schemas.registro_acciones_schemas import normalizar_nombre_rol

class RolSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Rol
        load_instance = True

    id_rol = ma.auto_field(dump_only=True)
    nombre = ma.auto_field(dump_only=True)    
    descripcion = ma.auto_field(dump_only=True)

    created_by = ma.auto_field(dump_only=True)

    updated_by = ma.auto_field(
        dump_only=True,
        allow_none=True
    )

    activo = ma.auto_field(dump_only=True)

    created_at = fields.DateTime(
        dump_only=True,
        format="iso"
    )

    updated_at = fields.DateTime(
        dump_only=True,
        format="iso"
    )

    # Acciones vigentes vinculadas a este rol - no es una columna de Rol,
    # se arma a partir de la relación roles_accion ya definida en el
    # modelo. Se usa para precargar el checklist al editar un rol desde
    # la UI.
    acciones = fields.Method("obtener_acciones_vigentes", dump_only=True)

    def obtener_acciones_vigentes(self, rol):
        return [
            {
                "id_accion": relacion.accion.id_accion,
                "servicio": relacion.accion.servicio,
                "nombre": relacion.accion.nombre,
            }
            for relacion in rol.roles_accion
            if relacion.activo and relacion.accion.activo
        ]


class RolCreateSchema(ma.Schema):
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

    # Lista de ids de Accion a vincular.
    id_acciones = fields.List(
        fields.Integer(
            strict=True,
            validate=validate.Range(min=1, error="Cada id de acción debe ser mayor a 0")
        ),
        load_default=list,
        error_messages={
            "null": "La lista de acciones no puede ser null"
        }
    )

    @pre_load
    def normalizar(self, datos, **kwargs):
        if isinstance(datos.get("nombre"), str):
            datos["nombre"] = normalizar_nombre_rol(datos["nombre"])
        return datos

    @validates("id_acciones")
    def validar_acciones_unicas(self, value, **kwargs):
        if len(value) != len(set(value)):
            raise ValidationError("La lista de acciones contiene ids duplicados")

    @validates_schema
    def validar_nombre_unico(self, data, **kwargs):
        nombre = data.get("nombre")

        if not nombre:
            return

        existente = Rol.query.filter_by(nombre=nombre).first()

        if existente:
            raise ValidationError({
                "nombre": [f"Ya existe un rol con el nombre '{nombre}'"]
            })


class RolUpdateSchema(ma.Schema):
    descripcion = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255),
        error_messages={
            "required": "La descripción del rol es obligatoria",
            "null": "La descripción del rol no puede ser null"
        }
    )

    id_acciones = fields.List(
        fields.Integer(
            strict=True,
            validate=validate.Range(min=1, error="Cada id de acción debe ser mayor a 0")
        ),
        required=True,
        error_messages={
            "required": "La lista de acciones es obligatoria",
            "null": "La lista de acciones no puede ser null"
        }
    )

    @validates("id_acciones")
    def validar_acciones_unicas(self, value, **kwargs):
        if len(value) != len(set(value)):
            raise ValidationError("La lista de acciones contiene ids duplicados")


rol_schema = RolSchema()
roles_schema = RolSchema(many=True)

rol_create_schema = RolCreateSchema()
rol_update_schema = RolUpdateSchema()