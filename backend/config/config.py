"""
Este archivo contiene la configuración principal de la aplicación

En este caso define la conexión a la base de datos, utilizando SQLAlchemy y PostgreSQL
"""

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:postgres@postgres:5432/auth'
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False