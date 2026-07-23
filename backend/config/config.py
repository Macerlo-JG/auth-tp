"""
Este archivo contiene la configuración principal de la aplicación

Define la conexión a la base de datos (SQLAlchemy y PostgreSQL),
la conexión a Redis (sesiones y rate limiting) y la configuración
de JWT (Flask-JWT-Extended) y Flask-Limiter
"""

from datetime import timedelta

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

    # auth-common
    AUTH_COMMON_REDIS_URL = REDIS_URL
    AUTH_COMMON_SESSION_TTL = JWT_ACCESS_TOKEN_EXPIRES

    AUTH_COMMON_ENDPOINTS_EXCEPTUADOS = [
        "auth.login",
        "auth.refresh",
        "auth.logout"
    ]