# Auth

# Guía de instalación

# Clonar el repositorio

```bash
git clone https://github.com/unlz-programacion/2026-caba-1c-auth.git

cd auth-tp
```

# Levantar el proyecto

Actualmente el archivo `docker-compose.yml` se encuentra dentro de la carpeta `deploy`.

Ingresar a dicha carpeta:

```bash
cd deploy
```

Construir las imágenes y levantar los servicios:

```bash
docker compose up --build
```

# Servicios disponibles

Una vez iniciado el proyecto estarán disponibles los siguientes servicios:

| Servicio    | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| PostgreSQL  | http:/localhost:5432  |
| PgAdmin     | http://localhost:5050 |

Para detener los contenedores:

```bash
docker compose down
```

Si además desea eliminar los volúmenes de la base de datos:

```bash
docker compose down -v
```

# Configuración de Flask-Mail

Para habilitar el envío de correos (OTP, bienvenida, etc.) necesitas configurar las variables de entorno.

## Modo Desarrollo (Consola)

Si NO configuras las variables, los correos se mostrarán en la consola del backend. Esto es útil para desarrollo local.

## Modo Producción (Correos Reales)

Para enviar correos reales, copia el archivo `.env.example` a `.env` en la carpeta `backend/` y configura:

```bash
cp backend/.env.example backend/.env
```

Luego edita `backend/.env` con tus credenciales:

### Opción 1: Gmail

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion
MAIL_DEFAULT_SENDER=tu_email@gmail.com
```

**⚠️ Importante para Gmail:**
1. Accede a [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Busca "Contraseñas de aplicación" (solo disponible si tienes 2FA habilitado)
3. Selecciona "Correo" y "Windows"
4. Copia la contraseña de aplicación generada en `MAIL_PASSWORD`

### Opción 2: Otro servidor SMTP

```env
MAIL_SERVER=smtp.office365.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_email@outlook.com
MAIL_PASSWORD=tu_contraseña
```

# Tecnologías utilizadas

## Backend

- Python 3.12
- Flask
- SQLAlchemy
- PostgreSQL
- Flask-Mail

## Frontend

- React
- Vite
- React Router
- Axios

## Infraestructura

- Docker
- Docker Compose
- PgAdmin
