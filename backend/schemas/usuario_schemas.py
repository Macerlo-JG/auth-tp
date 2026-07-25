from marshmallow import ValidationError, validates_schema, fields, validates, validate
from models.usuario import EstadoUsuario
from db import ma
from models.usuario import Usuario

class UsuarioBaseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Usuario
        load_instance = True

    id_usuario = ma.auto_field(dump_only=True)

    id_persona = ma.auto_field(dump_only=True)

    estado_usuario = fields.Enum(
        EstadoUsuario,
        by_value=True
    )

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

class UsuarioCreateSchema(UsuarioBaseSchema):
    id_persona = ma.auto_field(
        required=True,
        error_messages={
            "required": "La persona es obligatoria",
            "null": "La persona no puede ser null"
        }
    )

    estado_usuario = fields.Enum(
        EstadoUsuario,
        by_value=True,
        dump_only=True
    )

    @validates_schema
    def validar_persona_unica(self, data, **kwargs):
        id_persona = data.get("id_persona")

        if not id_persona:
            return

        existente = (
            Usuario.query
            .with_entities(Usuario.id_usuario)
            .filter_by(id_persona=id_persona)
            .first()
        )

        if existente:
            raise ValidationError({
                "id_persona": [
                    f"La persona {id_persona} ya posee un usuario asociado"
                ]
            })
        
class UsuarioUpdateSchema(UsuarioBaseSchema):
    id_persona = ma.auto_field(
        required=False,
    )

    estado_usuario = fields.Enum(
        EstadoUsuario,
        required=True,
        by_value=True,
        error_messages={
            "required": "El estado es obligatorio",
            "null": "El estado no puede ser null"
        }
    )

class UsuarioCompletoConRolesSchema(ma.Schema):
    """
    Valida los tres campos de 'POST /usuarios/completo-con-roles' en un
    solo paso: id_persona, email e id_roles. 

    Solo valida datos de entrada sueltos, la construcción real del
    Usuario se sigue haciendo con UsuarioCreateSchema, ya validado.
    """
    id_persona = fields.Integer(
        required=True,
        strict=True,
        validate=[
            validate.Range(
                min=1,
                error="id_persona debe ser mayor a 0"
            )
        ],
        error_messages={
            "required": "La persona es obligatoria",
            "null": "La persona no puede ser null"
        }
    )

    email = fields.Email(
        required=True,
        error_messages={
            "required": "El email es obligatorio",
            "null": "El email no puede ser null",
            "invalid": "El email no tiene un formato válido"
        }
    )

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

    @validates("id_persona")
    def validar_persona_unica(self, value, **kwargs):
        existente = (
            Usuario.query
            .with_entities(Usuario.id_usuario)
            .filter_by(id_persona=value)
            .first()
        )
        if existente:
            raise ValidationError(
                f"La persona {value} ya posee un usuario asociado"
            )

    @validates("id_roles")
    def validar_roles_unicos(self, value, **kwargs):
        if len(value) != len(set(value)):
            raise ValidationError(
                "La lista de roles contiene roles duplicados"
            )

usuario_schema = UsuarioBaseSchema()
usuarios_schema = UsuarioBaseSchema(many=True)

usuario_create_schema = UsuarioCreateSchema()
usuario_update_schema = UsuarioUpdateSchema()
usuario_completo_con_roles_schema = UsuarioCompletoConRolesSchema()