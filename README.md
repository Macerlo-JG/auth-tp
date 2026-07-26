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
| Backend API | http://localhost:5924 |
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

# Tecnologías utilizadas

## Backend

- Python 3.12
- Flask
- SQLAlchemy
- PostgreSQL

## Frontend

- React
- Vite
- React Router
- Axios

## Infraestructura

- Docker
- Docker Compose
- PgAdmin
