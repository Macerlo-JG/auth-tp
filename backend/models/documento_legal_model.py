from datetime import datetime
from sqlalchemy import Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from db import db


class DocumentoLegal(db.Model):
    __tablename__ = "documentos_legales"

    id_documento: Mapped[int] = mapped_column(Integer, primary_key=True)

    tipo: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)

    contenido: Mapped[str] = mapped_column(Text, nullable=False)

    fecha_de_publicacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Nombres de rol separados por coma (ej: "ALUMNO,DOCENTE").
    # NULL o cadena vacía = aplica a todos los usuarios.
    # Sin integridad referencial: si un rol se borra o renombra en la
    # tabla `roles`, esta columna no se actualiza automáticamente.
    roles_requeridos: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_by: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_by: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    aceptaciones = relationship("UsuarioDocumentoLegal", back_populates="documento")

    def lista_roles_requeridos(self):
        """Devuelve los roles como lista de strings, sin espacios ni vacíos."""
        if not self.roles_requeridos:
            return []
        return [r.strip() for r in self.roles_requeridos.split(",") if r.strip()]

    def __repr__(self):
        return f"<DocumentoLegal tipo={self.tipo} version={self.version} vigente={self.vigente}>"