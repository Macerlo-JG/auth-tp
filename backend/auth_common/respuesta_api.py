"""
Formato de respuesta HTTP estándar, compartido por todos los endpoints.
"""

from flask import jsonify

def respuesta_api(ok=True, data=None, message="", status=200):
    return jsonify({
        "ok": ok,
        "data": data if data is not None else [],
        "count": len(data) if isinstance(data, list) else (1 if data else 0),
        "message": message
    }), status