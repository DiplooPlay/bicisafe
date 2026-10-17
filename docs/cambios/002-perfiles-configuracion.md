# 002 — Perfiles de configuración

## Fecha
2026-10-17

## Archivos
- `backend/src/main/resources/application.yml` (creado)
- `backend/src/main/resources/application.properties` (eliminado)

## Qué se hizo
Se reemplazó `application.properties` por `application.yml` con configuración común y dos
perfiles (`dev`, `prod`) usando documentos separados por `---` y `spring.config.activate.on-profile`.

Se movieron todos los valores sensibles a **variables de entorno** con valores por defecto solo en `dev`.

Configuración incluida:

| Clave | Perfil | Variable de entorno | Valor por defecto |
|-------|--------|---------------------|-------------------|
| `spring.datasource.url` | dev | `DB_URL` | `jdbc:postgresql://localhost:5432/bicisafe` |
| `spring.datasource.username` | dev | `DB_USERNAME` | `bicisafe` |
| `spring.datasource.password` | dev | `DB_PASSWORD` | `bicisafe` |
| `spring.datasource.url` | prod | `DB_URL` | *(obligatoria)* |
| `app.jwt.secret` | dev | `JWT_SECRET` | secreto de desarrollo |
| `app.jwt.secret` | prod | `JWT_SECRET` | *(obligatoria)* |
| `app.jwt.expiration-minutes` | todos | `JWT_EXPIRATION_MINUTES` | `60` |
| `app.cors.allowed-origins` | todos | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| `app.ors.base-url` | todos | `ORS_BASE_URL` | `https://api.openrouteservice.org` |
| `app.ors.api-key` | todos | `ORS_API_KEY` | *(vacío)* |
| `spring.mail.*` | dev/prod | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail `smtp.gmail.com:587` |
| `server.port` | todos | `SERVER_PORT` | `8080` |

Además:
- `spring.jpa.hibernate.ddl-auto: validate` — el esquema lo gobierna Flyway, Hibernate solo valida.
- `spring.jpa.open-in-view: false` — evita el antipatrón de sesión abierta durante la vista.
- Actuator expone `health,info` (health check de Render).
- springdoc publica Swagger UI en `/swagger-ui.html` y el JSON en `/v3/api-docs`.
- `logging.level.pe.edu.untels.bicisafe` en DEBUG (dev) / INFO (prod).

## Por qué
- **YAML** permite perfiles y estructuras anidadas de forma más legible que `.properties`.
- Los secretos (contraseña de BD, `JWT_SECRET`, credenciales SMTP, `ORS_API_KEY`) **no** deben
  quedar en el repositorio: se leen de variables de entorno, que en local vienen de `.env`/`docker-compose`
  y en producción de los *Secrets* de Render/GitHub. En `prod` no hay valores por defecto: si falta
  una variable, la app falla al arrancar (fail-fast) en lugar de usar un valor inseguro.
- `ddl-auto: validate` evita que Hibernate modifique el esquema por su cuenta y mantiene a Flyway
  como única fuente de verdad de la estructura de la base de datos.

## Notas / pendientes
- `JWT_SECRET` en producción debe tener al menos 32 bytes (HS256).
- El perfil activo por defecto es `dev` (`SPRING_PROFILES_ACTIVE`), útil en local.
