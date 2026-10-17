# Cambio 019: Corrección de CORS, enlace de verificación, manejo de vías en rutas y guía de despliegue

## Fecha

2026-10-17

## Archivos modificados

- `backend/src/main/resources/application.yml` (puertos permitidos en CORS y `app.frontend.base-url` configurados a puerto 3000 por defecto).
- `.env` y `.env.example` (`CORS_ALLOWED_ORIGINS` y `FRONTEND_URL` actualizados al puerto 3000).
- `backend/src/main/java/pe/edu/untels/bicisafe/integracion/ors/OrsAdapter.java` (captura específica de error 404/2010 de OpenRouteService con mensajes guiados de vías transitables).
- `frontend/src/components/rutas/PlanificadorRuta.tsx` (debounce de 300 ms, auto-resolución de coordenadas al enviar formulario y feedback visual de búsqueda sin resultados).
- `docs/cambios/README.md` (registro cronológico del cambio 019).
- `docs/cambios/019-fix-cors-rutas-verificacion-y-guia-despliegue.md` (este documento).

---

## Qué se hizo

### 1. Desbloqueo de búsqueda por CORS y corrección de puertos
- **Problema**: El frontend corre en el puerto `3000` (según `frontend/vite.config.ts`), mientras que el backend permitía por defecto solo `http://localhost:5173`. Las llamadas a `/api/lugares?texto=...` eran rechazadas con `HTTP 403 Forbidden (Invalid CORS request)` y silenciadas en el frontend, impidiendo ver sugerencias al tipear.
- **Solución**: Se actualizaron `application.yml`, `.env` y `.env.example` estableciendo:
  `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000`.

### 2. Auto-resolución inteligente y debounce en el planificador
- Se agregó debounce de **300 ms** en `PlanificadorRuta.tsx` para evitar saturar el servicio abierto de Nominatim en cada pulsación de tecla (evitando respuestas 429 Too Many Requests).
- Se implementó **auto-resolución al pulsar "Calcular Ruta"** o presionar Enter: si el ciclista escribe un destino o lugar válido sin hacer clic en el menú desplegable, el componente consulta las coordenadas del primer resultado y calcula la ruta directamente, eliminando el bloqueo que obligaba a seleccionar del desplegable.
- Se incorporó un aviso visual cuando la búsqueda no arroja coincidencias en Lima Metropolitana.

### 3. Diagnóstico preciso en cálculo de rutas con GPS de PC (`OrsAdapter`)
- **Problema**: Al pulsar "Usar mi GPS" en computadoras sin chip satelital, la triangulación por IP del navegador arrojaba un margen de error de más de 680 km, ubicando el origen en la sierra de Yauyos (`-12.272, -76.271`). OpenRouteService devolvía `404 (código 2010: Could not find routable point within 350m)` porque no existen vías ciclistas transitables en medio de cerros o montañas. El backend mostraba un mensaje genérico falso de servicio no disponible.
- **Solución**: En `OrsAdapter.java`, se detectan los códigos `2010`, `2099` y textos de vía no encontrada, informando claramente:
  *"No se encontró una vía ciclista cerca del origen (zona no transitable o fuera de Lima). Si usas PC, escribe un origen en Lima en lugar del GPS."*

### 4. Corrección de enlace en correo de verificación (`FRONTEND_URL`)
- **Problema**: El enlace enviado al correo del ciclista se construía con el puerto 5173 (`http://localhost:5173?token=...`). Al hacer clic, el navegador arrojaba error de conexión porque el frontend corre en el 3000.
- **Solución**: Se actualizó `FRONTEND_URL=http://localhost:3000` en `.env`, `.env.example` y `application.yml`. Todos los correos de confirmación nuevos apuntan al puerto activo.

---

## Cómo se verificó

1. **Pruebas de red en vivo**:
   - `GET /api/lugares?texto=villa el salvador` con `Origin: http://localhost:3000` → `HTTP 200 OK` con sugerencias de Lima.
   - `GET /api/rutas?latOrigen=-12.12&lngOrigen=-77.03&latDestino=-12.21689&lngDestino=-76.94914` → `HTTP 200 OK` con distancia de 17.9 km, 61 min y 437 puntos de geometría.
2. **Pruebas automáticas Swagger / OpenAPI**:
   - Se ejecutó suite de verificación contra los 11 endpoints documentados en Swagger (`/v3/api-docs` y `/swagger-ui/index.html`), pasando al 100% (búsqueda, rutas, login, logout, usuarios y seguridad JWT).
3. **Pruebas de regresión**:
   - Backend: `./mvnw test` → 27 pruebas en verde sin fallos.
   - Frontend: `npm test` → 4 pruebas en verde (hooks y componentes).

---

## Guía de Despliegue (Producción)

Si se decide desplegar BiciSafe en servidores de producción (VPS, Docker, Cloud, AWS, Render, Railway, Vercel, Netlify, etc.), estos son los archivos y variables que se deben configurar:

### 1. Variables de entorno del Backend (`.env` o variables del servidor)

El backend de Spring Boot lee las variables de entorno del sistema operativo. Al desplegar en producción se deben definir:

| Variable | Descripción | Ejemplo Producción |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Activa el perfil de producción en `application.yml`. | `prod` |
| `SERVER_PORT` | Puerto donde escucha el backend de Spring Boot. | `8080` |
| `DB_URL` | URL JDBC de la base de datos PostgreSQL con PostGIS. | `jdbc:postgresql://db.midominio.com:5432/bicisafe` |
| `DB_USERNAME` | Usuario de PostgreSQL en producción. | `bicisafe_prod_user` |
| `DB_PASSWORD` | Contraseña segura de la base de datos. | `ClaveSuperSegura123!` |
| `JWT_SECRET` | Clave criptográfica para firmar tokens JWT (mínimo 32 caracteres / 256 bits). | `clave-secreta-de-produccion-de-al-menos-32-caracteres!` |
| `JWT_EXPIRATION_MINUTES` | Duración de la sesión antes de expirar. | `1440` (24 horas) |
| `CORS_ALLOWED_ORIGINS` | Dominios permitidos del frontend (separados por coma). | `https://bicisafe.pe,https://www.bicisafe.pe` |
| `FRONTEND_URL` | URL pública de la aplicación para enlaces en correos electrónicos. | `https://bicisafe.pe` |
| `ORS_BASE_URL` | Endpoint base de OpenRouteService. | `https://api.openrouteservice.org` |
| `ORS_API_KEY` | Llave API registrada de OpenRouteService. | `5b3ce3597851110001cf6248...` |
| `NOMINATIM_BASE_URL` | Endpoint base de geocodificación OpenStreetMap. | `https://nominatim.openstreetmap.org` |
| `MAIL_HOST` | Servidor SMTP para envío de correos. | `smtp.gmail.com` (o SendGrid, AWS SES) |
| `MAIL_PORT` | Puerto TLS del servidor SMTP. | `587` |
| `MAIL_USERNAME` | Usuario o correo emisor SMTP. | `notificaciones@bicisafe.pe` |
| `MAIL_PASSWORD` | Contraseña de aplicación SMTP. | `token-app-password` |
| `MAIL_FROM` | Dirección mostrada en el remitente del correo. | `notificaciones@bicisafe.pe` |

### 2. Configuración y compilación del Frontend

En el frontend, la URL del backend se define mediante la variable de entorno de Vite:

1. **Archivo a crear o editar**: `frontend/.env.production`
   ```env
   VITE_API_URL=https://api.bicisafe.pe
   ```
   *(Si el frontend y el backend se sirven bajo el mismo dominio detrás de un reverse proxy como Nginx, puede dejarse vacío o como `""` para que use rutas relativas `/api`)*.

2. **Compilar los archivos estáticos optimizados**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   Esto genera los archivos listos para producción dentro de la carpeta `frontend/dist`.

3. **Servir el Frontend**:
   Los archivos de `frontend/dist` se pueden subir a cualquier servidor web estático (Nginx, Apache, Cloudflare Pages, Vercel, Netlify, AWS S3 + CloudFront).

### 3. Compilación y ejecución del Backend

1. **Generar el archivo JAR ejecutable**:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```
   Esto compila y genera el artefacto en `backend/target/bicisafe-0.0.1-SNAPSHOT.jar`.

2. **Ejecutar en el servidor**:
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   # ... exportar las demás variables de producción ...
   java -jar target/bicisafe-0.0.1-SNAPSHOT.jar
   ```
   O mediante servicio `systemd`, contenedor Docker o Kubernetes inyectando las variables de entorno.
