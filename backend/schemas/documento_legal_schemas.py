from marshmallow import fields
from db import ma
from models.documento_legal_model import DocumentoLegal


class DocumentoLegalSchema(ma.SQLAlchemySchema):
    class Meta:
        model = DocumentoLegal
        load_instance = False

    id_documento = ma.auto_field(dump_only=True)
    tipo = ma.auto_field()
    version = ma.auto_field()
    titulo = ma.auto_field()
    contenido = ma.auto_field()
    vigente = ma.auto_field(dump_only=True)

    fecha_publicacion = fields.DateTime(attribute="fecha_de_publicacion", format="iso")

    # Se expone como lista, aunque en DB vive como string separado por comas.
    roles_requeridos = fields.Method("_dump_roles")

    created_at = fields.DateTime(dump_only=True, format="iso")
    updated_at = fields.DateTime(dump_only=True, format="iso")

    created_by = ma.auto_field(dump_only=True)
    updated_by = ma.auto_field(dump_only=True, allow_none=True)
    activo = ma.auto_field(dump_only=True)

    def _dump_roles(self, documento):
        return documento.lista_roles_requeridos()


documento_legal_schema = DocumentoLegalSchema()
documentos_legales_schema = DocumentoLegalSchema(many=True)