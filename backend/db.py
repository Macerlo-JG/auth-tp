from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_marshmallow import Marshmallow
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from config.config import Config


class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
ma = Marshmallow()
mail = Mail()

# key_func por defecto: limita por IP. Los endpoints que también necesitan
# limitar por usuario/email agregan un segundo @limiter.limit con su propia
# key_func. default_limits=[] porque no hay límite
# global: cada endpoint sensible declara el suyo explícitamente.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[],
    storage_uri=Config.RATELIMIT_STORAGE_URI,
)