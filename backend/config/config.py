"""
Este archivo contiene la configuración principal de la aplicación

Define la conexión a la base de datos (SQLAlchemy y PostgreSQL),
la conexión a Redis (sesiones y rate limiting) y la configuración
de JWT (Flask-JWT-Extended) y Flask-Limiter
"""

from datetime import timedelta
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:postgres@postgres:5432/auth'
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    # Redis: guarda la sesión de usuario (roles, acciones, refresh_jti, id_persona).
    # DB 0 reservada para sesiones.
    REDIS_URL = 'redis://redis:6379/0'

    # JWT: secret key y TTL de access y refresh token.
    # JWT_ACCESS_TOKEN_EXPIRES se reutiliza también como TTL de la sesión en Redis.
    JWT_SECRET_KEY = '811ea3c35704a634c6bd13710d919b63b79d76435321431ff7466facf89dcddf'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    # DB 1: separada de las sesiones (DB 0), mismo Redis.
    RATELIMIT_STORAGE_URI = 'redis://redis:6379/1'

    # Flask-Mail: Configuración de envío de correos
    # Para usar Gmail: usar contraseña de aplicación (no la contraseña de la cuenta)
    # Variables de entorno disponibles:
    # - MAIL_SERVER: servidor SMTP (ej: smtp.gmail.com)
    # - MAIL_PORT: puerto SMTP (ej: 587 para TLS, 465 para SSL)
    # - MAIL_USE_TLS: True para TLS
    # - MAIL_USERNAME: email del remitente
    # - MAIL_PASSWORD: contraseña o token de la aplicación
    # - MAIL_DEFAULT_SENDER: email que aparece como remitente
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', os.getenv('MAIL_USERNAME', 'noreply@academia.local'))