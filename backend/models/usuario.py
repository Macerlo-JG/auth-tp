from db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    Integer,
    Boolean,
    DateTime,
    Enum
)
from datetime import datetime
from sqlalchemy.sql import func
import enum

class EstadoUsuario(enum.Enum):
    PENDIENTE = "PENDIENTE"
    ACTIVO = "ACTIVO"
    BLOQUEADO = "BLOQUEADO"
    INACTIVO = "INACTIVO"

class Usuario(db.Model):
    __tablename__ = "usuarios"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_persona: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)

    estado_usuario: Mapped[EstadoUsuario] = mapped_column(
        Enum(
            EstadoUsuario,
            name="estado_usuario"
        ),
        nullable=False,
        default=EstadoUsuario.PENDIENTE
    )

    roles_usuario = relationship("RolUsuario", back_populates="usuario")
    #añado relación 1-1 con credenciales
    credencial = relationship("Credencial", back_populates="usuario")

    created_by: Mapped[int] = mapped_column(Integer, nullable=False)

    updated_by: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=func.now()
    )

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Id usuario={self.id_usuario}>"