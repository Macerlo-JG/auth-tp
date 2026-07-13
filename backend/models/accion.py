from db import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    Integer,
    Boolean,
    String,
    DateTime,
    UniqueConstraint
)
from datetime import datetime
from sqlalchemy.sql import func

class Accion(db.Model):
    __tablename__ = "acciones"
    __table_args__ = (
        UniqueConstraint("servicio", "nombre", name="uq_acciones_servicio_nombre"),
    )

    id_accion: Mapped[int] = mapped_column(Integer, primary_key=True)
    servicio: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(255), nullable=False)

    roles_accion = relationship("RolAccion", back_populates="accion")

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
        return f"<Accion={self.servicio}.{self.nombre}>"