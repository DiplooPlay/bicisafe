# 003 — PostgreSQL/PostGIS local y migración Flyway

## Fecha
2026-10-17

## Archivos
- `docker-compose.yml` (creado, raíz del repositorio)
- `backend/src/main/resources/db/migration/V1__habilita_postgis.sql` (creado)

## Qué se hizo
Se añadió un `docker-compose.yml` para levantar PostgreSQL con la extensión PostGIS en desarrollo,
y la primera migración de Flyway que habilita las extensiones requeridas.

### `docker-compose.yml`
- Servicio `postgres` con imagen `postgis/postgis:16-3.4` (PostgreSQL 16 + PostGIS 3.4).
- Base `bicisafe`, usuario `bicisafe`, contraseña `bicisafe` (solo desarrollo, coincide con los
  valores por defecto de `application.yml` del perfil `dev`).
- Puerto `5432:5432` y volumen con nombre `bicisafe-pgdata` para persistir datos.
- `healthcheck` con `pg_isready` para saber cuándo está lista.

### `V1__habilita_postgis.sql`
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Por qué
- **PostGIS** es una extensión de PostgreSQL (no un motor aparte); se necesita una imagen que ya
  la incluya. `postgis/postgis` es la imagen oficial mantenida por el equipo de PostGIS.
- Se usa **Docker Compose** para que cualquier integrante levante el mismo entorno con un solo
  comando (`docker compose up -d`) sin instalar PostgreSQL a mano.
- **Flyway** gestiona el esquema versionado. `V1` habilita `postgis` (geometrías para rutas e
  incidentes) y `uuid-ossp` (alternativa para generar UUIDs). Las tablas de dominio se agregarán
  en migraciones posteriores (`V2__...`, `V3__...`) conforme se implementen los módulos.
- `IF NOT EXISTS` hace la migración **idempotente**: no falla si la extensión ya existe.

## Cómo usarlo
```bash
# 1) Levantar la base
docker compose up -d

# 2) Verificar
docker compose ps

# 3) Arrancar el backend (las migraciones corren solas al iniciar)
cd backend && ./mvnw spring-boot:run
```

## Notas / pendientes
- En proveedores gestionados (Render, Neon, Supabase) PostGIS puede requerir habilitarse desde el
  panel; si `CREATE EXTENSION` falla por permisos, se habilita ahí y se ajusta la migración.
- Pendiente: agregar el servicio `backend` al compose (perfil de desarrollo completo con la app).
