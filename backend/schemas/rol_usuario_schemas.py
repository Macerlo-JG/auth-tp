from db import ma
from marshmallow import fields, validate, validates, ValidationError
from models.rol_usuario import RolUsuario

class RolUsuarioBaseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = RolUsuario
        load_instance = True

    id_rol_usuario = ma.auto_field(dump_only=True)
    id_usuario = ma.auto_field(dump_only=True)
    id_rol = ma.auto_field(dump_only=True)

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

class AsignarRolesSchema(ma.Schema):
    id_roles = fields.List(
        fields.Integer(
            strict=True,
            validate=[
                validate.Range(
                    min=1,
                    error="Cada id de rol debe ser mayor a 0"
                )
            ]
        ),
        required=True,
        validate=[
            validate.Length(
                min=1,
                error="Debe asignar al menos un rol"
            )
        ],
        error_messages={
            "required": "La lista de roles es obligatoria",
            "null": "La lista de roles no puede ser null"
        }
    )

    created_by = fields.Integer(
        required=True,
        validate=[
            validate.Range(
                min=1,
                error="El usuario creador debe ser mayor a 0"
            )
        ],
        error_messages={
            "required": "El usuario creador es obligatorio",
            "null": "El usuario creador no puede ser null",
        }
    )

    @validates("id_roles")
    def validar_roles_unicos(self, value, **kwargs):
        if len(value) != len(set(value)):
            raise ValidationError(
                "La lista de roles contiene roles duplicados"
            )
        
class RevocarRolSchema(ma.Schema):
    updated_by = fields.Integer(
        required=True,
        validate=[
            validate.Range(
                min=1,
                error="El usuario modificador debe ser mayor a 0"
            )
        ],
        error_messages={
            "required": "El usuario modificador es obligatorio",
            "null": "El usuario modificador no puede ser null"
        }
    )

class RevocarRolesSchema(ma.Schema):
    id_roles = fields.List(
        fields.Integer(
            strict=True,
            validate=[
                validate.Range(
                    min=1,
                    error="Cada id de rol debe ser mayor a 0"
                )
            ]
        ),
        required=True,
        validate=[
            validate.Length(
                min=1,
                error="Debe indicar al menos un rol"
            )
        ],
        error_messages={
            "required": "La lista de roles es obligatoria",
            "null": "La lista de roles no puede ser null"
        }
    )

    updated_by = fields.Integer(
        required=True,
        validate=[
            validate.Range(
                min=1,
                error="El usuario modificador debe ser mayor a 0"
            )
        ],
        error_messages={
            "required": "El usuario modificador es obligatorio",
            "null": "El usuario modificador no puede ser null"
        }
    )

    @validates("id_roles")
    def validar_roles_unicos(self, value, **kwargs):
        if len(value) != len(set(value)):
            raise ValidationError(
                "La lista de roles contiene roles duplicados"
            )

roles_usuario_schema = RolUsuarioBaseSchema()
roles_usuarios_schema = RolUsuarioBaseSchema(many=True)

asignar_roles_schema = AsignarRolesSchema()
revocar_rol_schema = RevocarRolSchema()
revocar_roles_schema = RevocarRolesSchema()