"""
Mock temporal
"""

EMAILS_MOCK = {
    "admin@test.com": 1,
    "alumno@test.com": 2,      
    "docente@test.com": 3,     
}

def obtener_id_persona_por_email(email):
    return EMAILS_MOCK.get(email)