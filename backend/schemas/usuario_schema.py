from marshmallow import ValidationError, validates_schema, fields
from models.usuario import EstadoUsuario
from db import ma
from models.usuario import Usuario


class UsuarioBaseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Usuario
        load_instance = True

    id_usuario = ma.auto_field(
        dump_only=True
    )

    id_persona = ma.auto_field()

    estado_usuario = fields.Enum(
        EstadoUsuario,
        by_value=True
    )

    created_by = ma.auto_field()

    updated_by = ma.auto_field(
        allow_none=True
    )

    activo = ma.auto_field(
        dump_only=True
    )

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

    created_by = ma.auto_field(
        required=True,
        error_messages={
            "required": "El usuario creador es obligatorio",
            "null": "El usuario creador no puede ser null"
        }
    )

    estado_usuario = fields.Enum(
        EstadoUsuario,
        by_value=True,
        dump_only=True
    )

    updated_by = ma.auto_field(
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

    updated_by = ma.auto_field(
        required=True,
        error_messages={
            "required": "El usuario modificador es obligatorio",
            "null": "El usuario modificador no puede ser null"
        }
    )

    @validates_schema
    def validar_actualizacion(self, data, **kwargs):

        if self.instance and "updated_by" not in data:
            raise ValidationError({
                "updated_by": [
                    "El usuario modificador es obligatorio"
                ]
            })

usuario_schema = UsuarioBaseSchema()
usuarios_schema = UsuarioBaseSchema(many=True)
usuario_create_schema = UsuarioCreateSchema()
usuario_update_schema = UsuarioUpdateSchema()