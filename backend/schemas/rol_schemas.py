from db import ma
from marshmallow import fields
from models.rol import Rol

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

rol_schema = RolSchema()
roles_schema = RolSchema(many=True)