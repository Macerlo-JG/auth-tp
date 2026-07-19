# Configuración de Flask-Mail

Este documento explica cómo configurar Flask-Mail para enviar correos electrónicos (OTP, bienvenida, etc.) en lugar de mostrarlos en consola.

## Modo Desarrollo (Por Defecto)

Si **no configuras** variables de entorno, los correos se mostrarán en la consola del backend:

```
============================================================
📧 CORREO (MODO DESARROLLO - CONSOLA)
============================================================
Para: usuario@example.com
Asunto: Código de activación de cuenta
------------------------------------------------------------
Su código de activación es: 123456

El código dura 10 minutos.

Para pruebas también puede usar el código: temporal
============================================================
```

Esto es ideal para desarrollo local sin necesidad de configurar credenciales.

---

## Modo Producción (Correos Reales)

Para enviar correos reales, necesitas configurar las variables de entorno con credenciales SMTP.

### Opción 1: Gmail

1. **Habilitar contraseñas de aplicación:**
   - Accede a [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Desplázate a "Seguridad" (esquina izquierda)
   - Busca "Contraseñas de aplicación" (solo aparece si tienes 2FA habilitado)
   - Selecciona "Correo" y "Windows"
   - Copia la contraseña de 16 caracteres generada

2. **Configurar variables de entorno:**

   **En desarrollo local** (crear archivo `backend/.env`):
   ```env
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=tu_email@gmail.com
   MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   MAIL_DEFAULT_SENDER=tu_email@gmail.com
   ```

   **En Docker** (crear archivo `deploy/.env`):
   ```env
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=tu_email@gmail.com
   MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   MAIL_DEFAULT_SENDER=tu_email@gmail.com
   ```

### Opción 2: Outlook/Office 365

```env
MAIL_SERVER=smtp.office365.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_email@outlook.com
MAIL_PASSWORD=tu_contraseña
MAIL_DEFAULT_SENDER=tu_email@outlook.com
```

### Opción 3: SendGrid

```env
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxx
MAIL_DEFAULT_SENDER=noreply@tudominio.com
```

---

## Verificar Funcionamiento

### Con consola:
Cuando solicites un OTP, verás el código en la terminal del backend:

```
============================================================
📧 CORREO (MODO DESARROLLO - CONSOLA)
...
Su código de activación es: 234567
...
============================================================
```

### Con correos reales:
Verás un mensaje como:

```
✅ Correo enviado a usuario@example.com
```

O si hay error:

```
❌ Error al enviar correo a usuario@example.com: [detalles del error]
```

---

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| "MAIL_SERVER no configurado" | Deja las variables vacías o cópialas del archivo `.env.example` |
| Error 535 en Gmail | Asegúrate de usar "Contraseña de aplicación" (16 caracteres), no la contraseña normal |
| Error de conexión | Verifica que el puerto sea correcto (587 para TLS, 465 para SSL) |
| Correos llegan a spam | Configura SPF, DKIM y DMARC en tu dominio |

---

## Implementación en el Código

El servicio `backend/services/email_service.py` se encarga de:

1. ✅ Detectar si hay configuración disponible
2. ✅ Si la hay: enviar por SMTP real
3. ✅ Si no: mostrar en consola para desarrollo
4. ✅ Guardar un registro de todos los correos en `_ultimos_envios`

Uso en rutas:

```python
from services.email_service import enviar_otp_activacion

# En el endpoint de solicitar OTP:
codigo = generar_otp("activacion", email)
enviar_otp_activacion(email, codigo)  # Envía real o a consola
```

---

## Notas de Seguridad

- ⚠️ **Nunca** guardes contraseñas en el código
- 🔐 Usa variables de entorno o `.env` (agregado a `.gitignore`)
- 🛡️ Para producción, usa servicios como SendGrid, Mailgun o AWS SES
- 📝 Considera usar plantillas HTML en lugar de texto plano
