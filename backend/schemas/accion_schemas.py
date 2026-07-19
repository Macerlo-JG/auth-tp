from db import ma
from marshmallow import fields
from models.accion import Accion

class AccionSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Accion
        load_instance = True

    id_accion = ma.auto_field(dump_only=True)
    servicio = ma.auto_field(dump_only=True)
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

accion_schema = AccionSchema()
acciones_schema = AccionSchema(many=True)