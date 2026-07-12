from werkzeug.security import check_password_hash
from models.credencial_model import Credencial

def obtener_por_usuario(id_usuario):
    # revisamos filas históricas, y revisamos por activo=True. debe existir como máximo una fila activa por usuario.
    return Credencial.query.filter_by(id_usuario=id_usuario, activo=True).first()


def verificar_password(id_usuario, password_plano):
    # recibe datos primitivos y devuelve un booleano.
    credencial = obtener_por_usuario(id_usuario)

    # Rechaza si no existe la credencial, o si está marcada inactiva
    if not credencial or not credencial.activo:
        return False

    # check_password_hash re-hashea el password recibido con el mismo salt/algoritmo
    # embebido en el hash guardado, y compara resultado — nunca se descifra el hash original
    # (PBKDF2 es de un solo sentido, no es reversible).
    return check_password_hash(credencial.password_hash, password_plano)