from models.usuario import Usuario
from models.rol import Rol
from models.rol_usuario import RolUsuario
from models.credencial_model import Credencial

# Registro centralizado de modelos para que SQLAlchemy conozca todas las entidades al iniciar la aplicación y evite errores de relaciones no resueltas