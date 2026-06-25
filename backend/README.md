# Guía de Uso

1. Ir a la carpeta raíz del proyecto (donde está `docker-compose.yml`).
2. Ejecutar Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Esperar a que se levante el servidor Flask.
4. La API estará disponible en:

   ```bash
   http://localhost:5000
   ```

# Colección de Postman

Se incluye una colección de Postman con todos los endpoints del sistema (usuarios y Localidades).

El archivo se encuentra en /postman/libreta-usuarios.postman_collection.json

Cómo importarla en Postman

1. Abrir **Postman**
2. Ir a **Importar**
3. Seleccionar el archivo `.json` del proyecto
4. Ejecutar las requests incluidas

## Endpoints incluidos

### usuarios

- GET /usuarios
- GET /usuarios/{id}
- POST /usuarios
- PUT /usuarios/{id}
- DELETE /usuarios/{id}

### Localidades

- GET /localidades
- GET /localidades/{id}
- POST /localidades
- PUT /localidades/{id}
- DELETE /localidades/{id}

# Guía de Endpoints con cURL

## usuarios

### GET /usuarios

```bash
curl -X GET http://localhost:5000/usuarios
```

### GET /usuarios/{id}

```bash
curl -X GET http://localhost:5000/usuarios/1
```

### POST /usuarios

```bash
curl -X POST http://localhost:5000/usuarios \
 -H "Content-Type: application/json" \
 -d '{
"nombre": "Juan",
"apellido": "Perez",
"direccion": "Calle 123",
"email": "juan@example.com",
"telefono": "1234567",
"id_localidad": 1
}'
```

### PUT /usuarios/{id}

```bash
curl -X PUT http://localhost:5000/usuarios/1 \
 -H "Content-Type: application/json" \
 -d '{
"telefono": "999999"
}'
```

### DELETE /usuarios/{id}

```bash
curl -X DELETE http://localhost:5000/usuarios/1
```

## Localidades

### GET /localidades

```bash
curl -X GET http://localhost:5000/localidades
```

### GET /localidades/{id}

```bash
curl -X GET http://localhost:5000/localidades/1
```

### POST /localidades

```bash
curl -X POST http://localhost:5000/localidades \
 -H "Content-Type: application/json" \
 -d '{
"nombre": "CABA",
"provincia": "Buenos Aires"
}'
```

### PUT /localidades/{id}

```bash
curl -X PUT http://localhost:5000/localidades/1 \
 -H "Content-Type: application/json" \
 -d '{
"nombre": "Chubut"
}'
```

### DELETE /localidades/{id}

```bash
curl -X DELETE http://localhost:5000/localidades/1
```
