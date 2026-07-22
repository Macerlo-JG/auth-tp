"""
Validación centralizada de sesión (before_request) y decorador de acciones
por endpoint.

validar_sesion() corre antes de cada request de la app (se registra en
app.py con @app.before_request). 
Si el endpoint no está en ENDPOINTS_EXCEPTUADOS, exige un access token válido y una sesión vigente en Redis (session:{id_usuario}) antes de dejar pasar la request.

requires_permission() se apoya en flask.g.acciones, que validar_sesion carga
en cada request autenticado, nunca lee la acción desde el JWT
"""

from functools import wraps

from flask import request, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from auth_common.sesion_common import obtener_sesion
from auth_common.respuesta_api import respuesta_api

# Endpoints que no pasan por la validación de sesión centralizada.
ENDPOINTS_EXCEPTUADOS = {
    "auth.iniciar_sesion",
    "auth.renovar_token",
    "auth.cerrar_sesion",
    "acciones.registrar",
    "credenciales.verificar_credencial",
    "activacion.solicitar_otp",
    "activacion.verificar",
    "recuperacion.solicitar_otp",
    "recuperacion.verificar_otp_endpoint",
    "recuperacion.cambiar_contrasena",
}

def validar_sesion():
    """
    Si el endpoint no está exceptuado, valida
    el access token y la sesión en Redis, y carga flask.g.id_usuario,
    flask.g.acciones (set) y flask.g.roles para el resto de la request.
    """
    if request.method == "OPTIONS":
        return None

    if request.endpoint in ENDPOINTS_EXCEPTUADOS:
        return None

    verify_jwt_in_request()
    id_usuario = int(get_jwt_identity())
    sesion = obtener_sesion(id_usuario)
    if sesion is None:
        return respuesta_api(False, [], "Sesión inválida o expirada", 401)
    g.id_usuario = id_usuario
    g.acciones = set(sesion["acciones"])
    g.roles = sesion["roles"]
    return None

def requires_permission(*acciones, policy="ALL"):
    """
    Decorador de autorización por endpoint.

    Uso:
        @requires_permission("auth.usuarios.ver")
        @requires_permission("legajo.planes.leer", "legajo.cursos.control_parcial", policy="ALL")
        @requires_permission("legajo.planes.leer", "legajo.cursos.ver", policy="ANY")

    policy="ALL" (default): el usuario necesita todas las acciones listadas.
    policy="ANY": alcanza con una de las acciones listadas.

    Los acciones que se pasan acá son el string completo "servicio.nombre",
    no el "nombre" suelto tal cual aparece en acciones.yml.

    Lee flask.g.acciones, cargado por validar_sesion() en el before_request,
    nunca desde el JWT.
    """
    
    if not acciones:
        raise ValueError("requires_permission necesita al menos una acción")

    if policy not in ("ALL", "ANY"):
        raise ValueError(f"política inválida: {policy}. Debe ser 'ALL' o 'ANY'")

    def decorador(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            acciones_usuario = getattr(g, "acciones", set())

            if policy == "ALL":
                autorizado = all(a in acciones_usuario for a in acciones)
            else:
                autorizado = any(a in acciones_usuario for a in acciones)

            if not autorizado:
                return respuesta_api(False, [], "No tenés permiso para realizar esta acción", 403)

            return fn(*args, **kwargs)
        return wrapper
    return decorador