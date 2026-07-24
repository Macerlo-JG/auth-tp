from datetime import datetime
from sqlalchemy import Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from db import db


class UsuarioDocumentoLegal(db.Model):
    __tablename__ = "usuario_documento_legal"

    id_usuario_documento_legal: Mapped[int] = mapped_column(Integer, primary_key=True)

    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuarios.id_usuario"), nullable=False)
    id_documento: Mapped[int] = mapped_column(ForeignKey("documentos_legales.id_documento"), nullable=False)

    fecha_aceptacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    created_by: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_by: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    documento = relationship("DocumentoLegal", back_populates="aceptaciones")

    def __repr__(self):
        return f"<UsuarioDocumentoLegal usuario={self.id_usuario} documento={self.id_documento}>"