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

class RolAccion(db.Model):
    __tablename__ = "roles_acciones"

    id_rol_accion: Mapped[int] = mapped_column(Integer, primary_key=True)

    id_rol: Mapped[int] = mapped_column(
        ForeignKey("roles.id_rol"),
        nullable=False
    )

    id_accion: Mapped[int] = mapped_column(
        ForeignKey("acciones.id_accion"),
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

    rol = relationship("Rol", back_populates="roles_accion")
    accion = relationship("Accion", back_populates="roles_accion")

    def __repr__(self):
        return f"<RolAccion rol={self.id_rol} accion={self.id_accion}>"