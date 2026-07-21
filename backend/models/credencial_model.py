from db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime

# Guardamos la contraseña de acceso de cada usuario en la base de datos.
# Solo hay una contraseña "vigente" por persona, las anteriores quedan archivadas.

class Credencial(db.Model):
    __tablename__ = "credenciales"

    id_credencial: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_usuario: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    usuario = relationship("Usuario", back_populates="credencial")

    # Indica si esta fila representa la contraseña que el usuario usa
    # actualmente para loguearse. Se mantiene separada de `activo` que
    # indica una baja/desactivación de la credencial.
    es_actual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_by: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_by: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)