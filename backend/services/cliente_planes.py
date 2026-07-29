"""
Cliente HTTP para el microservicio Planes.
"""

import requests
from flask import current_app

def obtener_persona_por_email(email):
    """
    Resuelve id_persona e id_legajo a partir de un email, consultando a Planes.

    Devuelve la tupla (id_persona, id_legajo). Si Planes no encontró
    ningún contacto con ese email, devuelve (None, None).
    """
    base_url = current_app.config.get("PLANES_URL", "http://planes-backend:5000")
    url = f"{base_url.rstrip('/')}/contactos/GetPersonaIDFromMail"

    try:
        response = requests.get(url, params={"email": email}, timeout=3)

        if response.status_code == 404:
            return None, None

        response.raise_for_status()

        data = response.json()["data"]
        id_persona = int(data["personaid"])
        id_legajo = data.get("legajoid")
        id_legajo = int(id_legajo) if id_legajo is not None else None

        return id_persona, id_legajo

    except requests.exceptions.RequestException as error:
        raise PlanesNoDisponibleError(f"No se pudo consultar Planes: {error}")


def obtener_email_por_id_persona(id_persona):
    """
    Resuelve el email principal a partir de un id_persona, consultando a Planes.

    Devuelve el email, o None si Planes no encontró la persona, o si la
    encontró pero no tiene un contacto de tipo Email marcado como principal.
    """
    base_url = current_app.config.get("PLANES_URL", "http://planes-backend:5000")
    url = f"{base_url.rstrip('/')}/legajos/GetPersonaFromPersonaId"

    try:
        response = requests.get(url, params={"id": id_persona}, timeout=3)

        if response.status_code == 404:
            return None

        response.raise_for_status()

        contactos = response.json()["data"]["persona"]["contactos_items"]
        for contacto in contactos:
            if contacto["tipo_contacto_id"] == 2 and contacto["principal"]:
                return contacto["contacto"]

        return None

    except requests.exceptions.RequestException as error:
        raise PlanesNoDisponibleError(f"No se pudo consultar Planes: {error}")


def obtener_personas():
    """
    Obtiene el listado de personas desde el microservicio Planes.

    Devuelve una lista de personas.
    """
    base_url = current_app.config.get("PLANES_URL", "http://planes-backend:5000")
    url = f"{base_url.rstrip('/')}/api/planes/personas"

    try:
        response = requests.get(url, timeout=3)

        response.raise_for_status()

        body = response.json()
        return body["data"]

    except requests.exceptions.RequestException as error:
        raise PlanesNoDisponibleError(f"No se pudo consultar Planes: {error}")


class PlanesNoDisponibleError(Exception):
    """Planes no respondió."""
    pass
