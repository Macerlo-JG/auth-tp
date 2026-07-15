from flask import Flask
from db import db, ma, limiter
from flask_cors import CORS
from config.config import Config
from flask_jwt_extended import JWTManager
from routes.usuarios import usuarios_bp
from routes.roles_usuarios import roles_usuarios_bp
from seed.seed_data import seed_data
from routes.credenciales_routes import credenciales_bp
from routes.auth_routes import auth_bp
from auth_common.respuesta_api import respuesta_api

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
JWTManager(app)
limiter.init_app(app)

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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)