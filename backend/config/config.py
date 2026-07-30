import os
from datetime import timedelta

class Config:
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://186.19.137.9:8480")
    
    SQLALCHEMY_DATABASE_URI = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@postgres-auth:5432/auth")
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    REDIS_URL = 'redis://redis:6379/0'

    # JWT_SECRET_KEY se lee de entorno. Si no está seteado, falla.
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY no está definida. Seteala como variable de entorno "
            "(ver .env.dev) antes de levantar la app."
        )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    RATELIMIT_STORAGE_URI = 'redis://redis:6379/1'

    # URL interna del microservicio Planes.
    PLANES_URL = os.environ.get("PLANES_URL", "http://bomberos_backend:5000")

    AUTH_COMMON_REDIS_URL = REDIS_URL
    AUTH_COMMON_SESSION_TTL = int(JWT_ACCESS_TOKEN_EXPIRES.total_seconds())

    AUTH_COMMON_ENDPOINTS_EXCEPTUADOS = [
        "auth.iniciar_sesion",
        "auth.cerrar_sesion",
        "auth.renovar_token",
        "activacion.solicitar_otp",
        "activacion.verificar",
        "recuperacion.solicitar_otp",
        "recuperacion.verificar_otp_endpoint",
        "recuperacion.cambiar_contrasena",
        "acciones.registrar",
        "health",
    ]

     # IPs de microservicios autorizados a llamar endpoints only_services=True
    # Separadas por coma en la variable de entorno, ej: "172.99.0.11,172.99.0.12" (Inscripción, Planes).
    AUTH_COMMON_SERVICIOS_PERMITIDOS = [
        ip.strip()
        for ip in os.environ.get("AUTH_COMMON_SERVICIOS_PERMITIDOS", "").split(",")
        if ip.strip()
    ]

    # --- Flask-Mail ---
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "sandbox.smtp.mailtrap.io")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 2525))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "false").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "no-reply@tudominio.com")