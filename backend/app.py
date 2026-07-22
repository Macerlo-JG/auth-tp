from flask import Flask
from db import db, ma, limiter
from flask_cors import CORS
from config.config import Config
from flask_jwt_extended import JWTManager
from auth_common import sesion_common
from routes.usuarios import usuarios_bp
from routes.roles_usuarios import roles_usuarios_bp
from routes.roles import roles_bp
from seed.seed_data import seed_data
from routes.credenciales_routes import credenciales_bp
from routes.auth_routes import auth_bp
from routes.activacion_routes import activacion_bp
from routes.recuperacion_routes import recuperacion_bp
from routes.acciones_routes import acciones_bp
from auth_common.respuesta_api import respuesta_api
from auth_common.decorador import validar_sesion

"""
Archivo principal de la aplicación:
Se inicia Flask, se conecta con SQLAlchemy y Marshmallow
Se registran los Blueprints
Se crean las tablas en la base de datos si no existen
Se configura CORS para permitir peticiones desde el origen del Frontend
"""

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
ma.init_app(app)
jwt_manager = JWTManager(app)


# Validación centralizada de tokens: además de verificar la firma,
# consultamos Redis para saber si la sesión existe y si el `jti` de
# refresh sigue siendo el mismo almacenado. Esto permite revocar tokens
# inmediatamente al cerrar sesión.
@jwt_manager.token_in_blocklist_loader
def check_token_revocado(jwt_header, jwt_payload):
    tipo = jwt_payload.get("type")
    identity = jwt_payload.get("sub") or jwt_payload.get("identity")
    if not identity:
        return True

    try:
        id_usuario = int(identity)
    except Exception:
        return True

    sesion = sesion_common.obtener_sesion(id_usuario)

    # Si no hay sesión en Redis, bloqueamos tanto access como refresh
    if not sesion:
        return True

    # Para refresh tokens, validamos el jti registrado
    if tipo == "refresh":
        return sesion.get("refresh_jti") != jwt_payload.get("jti")

    # Para access tokens, basta con que exista la sesión
    return False

limiter.init_app(app)

# Validación de sesión centralizada: corre antes de cada request, menos en los
# endpoints en ENDPOINTS_EXCEPTUADOS.
app.before_request(validar_sesion)

# Normaliza las respuestas por defecto de Flask-JWT-Extended al formato
# respuesta_api.
@jwt_manager.unauthorized_loader
def token_ausente(razon):
    return respuesta_api(False, [], "No se encontró un token de autenticación", 401)

@jwt_manager.invalid_token_loader
def token_invalido(razon):
    return respuesta_api(False, [], "El token de autenticación es inválido", 401)

@jwt_manager.expired_token_loader
def token_vencido(jwt_header, jwt_payload):
    return respuesta_api(False, [], "El token de autenticación venció, iniciá sesión de nuevo", 401)

@app.errorhandler(429)
def limite_excedido(error):
    # Sin esto, Flask-Limiter devuelve una página HTML
    return respuesta_api(False, [], "Demasiados intentos, esperá un momento y volvé a intentar", 429)

with app.app_context():
    db.create_all()    
    seed_data()

app.register_blueprint(usuarios_bp)    
app.register_blueprint(roles_usuarios_bp)
app.register_blueprint(credenciales_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(activacion_bp)
app.register_blueprint(recuperacion_bp)
app.register_blueprint(acciones_bp)
app.register_blueprint(roles_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)