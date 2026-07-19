from db import ma
from marshmallow import fields
from models.rol_accion import RolAccion

class RolAccionSchema(ma.SQLAlchemySchema):
    class Meta:
        model = RolAccion
        load_instance = True

    id_rol_accion = ma.auto_field(dump_only=True)
    id_rol = ma.auto_field(dump_only=True)
    id_accion = ma.auto_field(dump_only=True)

    created_by = ma.auto_field(dump_only=True)
    updated_by = ma.auto_field(dump_only=True, allow_none=True)

    created_at = fields.DateTime(
        dump_only=True,
        format="iso"
    )

    updated_at = fields.DateTime(
        dump_only=True,
        format="iso"
    )

    activo = ma.auto_field(dump_only=True)

roles_accion_schema = RolAccionSchema()
roles_acciones_schema = RolAccionSchema(many=True)