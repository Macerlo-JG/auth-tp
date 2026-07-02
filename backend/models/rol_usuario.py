from datetime import datetime
from sqlalchemy import (
    Integer,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from db import db

class RolUsuario(db.Model):
    __tablename__ = "roles_usuarios"

    id_rol_usuario: Mapped[int] = mapped_column(Integer, primary_key=True)

    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    id_rol: Mapped[int] = mapped_column(
        ForeignKey("roles.id_rol"),
        nullable=False
    )

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

    usuario = relationship("Usuario", back_populates="roles_usuario")
    rol = relationship("Rol", back_populates="roles_usuario")

def __repr__(self):
    return f"<RolUsuario usuario={self.id_usuario} rol={self.id_rol}>"