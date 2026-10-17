# 005 — Conexión a PostgreSQL local

## Fecha
2026-10-17

## Archivos
- `scripts/setup-postgres.sh` (creado)
- `backend/src/main/resources/application.yml` (modificado — perfil `dev`)

## Qué se hizo
Se optó por usar la instancia **local de PostgreSQL** (en lugar de Docker) como base de datos de
desarrollo, y se dejó aprovisionada mediante un script idempotente.

### Estado detectado
- Paquete `postgresql` instalado, pero el clúster **sin inicializar** y el servicio **apagado**.
- **Faltaba `postgis`** (solo estaban `postgresql` y `postgresql-libs`).

### `scripts/setup-postgres.sh`
Ejecutable con `sudo bash scripts/setup-postgres.sh`. Hace, de forma idempotente:
1. `pacman -S --needed postgis`.
2. `initdb` del clúster en `/var/lib/postgres/data` (solo si falta `PG_VERSION`).
3. `systemctl enable --now postgresql` y espera a `pg_isready`.
4. Crea el rol `user` con contraseña `1234` (o la actualiza si ya existe).
5. Crea la base `bicisafe` con dueño `user` (si no existe).
6. `CREATE EXTENSION IF NOT EXISTS postgis`.
7. Verifica la conexión e imprime la URL JDBC.

### `application.yml` (perfil `dev`)
Se cambiaron los valores por defecto de conexión:
```yaml
username: ${DB_USERNAME:user}
password: ${DB_PASSWORD:1234}
```
El `url` sigue siendo `jdbc:postgresql://localhost:5432/bicisafe` y las variables de entorno
siguen teniendo prioridad.

## Por qué
- Se usa la instancia local para simplificar el desarrollo (no requiere levantar contenedores) y
  porque el usuario ya tenía PostgreSQL instalado. El `docker-compose.yml` del cambio 003 queda
  como **alternativa**.
- **PostGIS es obligatorio**: la migración `V1__habilita_postgis.sql` ejecuta `CREATE EXTENSION postgis`,
  que falla si la extensión no está instalada a nivel de sistema.
- El script es **idempotente** para poder re-ejecutarlo sin duplicar roles/bases ni romper el clúster.
- El nombre de rol `user` es una palabra reservada de SQL, por eso siempre va entre comillas dobles
  (`"user"`) en las sentencias del script. Como cadena de conexión JDBC no hay problema.

## Notas / pendientes
- Credenciales `user`/`1234` son **solo para desarrollo local**; en producción se usan los secretos
  de las variables de entorno.
- Autenticación de PostgreSQL: el script crea el rol por el socket local como superusuario `postgres`
  (peer auth). La conexión de la app usa TCP (`localhost:5432`), que por defecto en Arch toma
  `scram-sha-256` para `host` en `pg_hba.conf`, de ahí que se defina contraseña.
- **Actualización (ver [007](007-configuracion-bd-portable.md))**: `scripts/setup-postgres.sh` era un
  aprovisionamiento puntual de esta máquina (Arch) y **se eliminó** del proyecto. El proyecto ahora
  solo se **conecta** a una base existente mediante variables de entorno.
