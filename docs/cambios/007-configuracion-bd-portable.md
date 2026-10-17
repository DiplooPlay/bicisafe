# 007 — Configuración portable de base de datos

## Fecha
2026-10-17

## Archivos
- `scripts/setup-postgres.sh` (eliminado)
- `.env.example` (creado)
- `.gitignore` (modificado: se ignora `.env` / `.env.local`)
- `docs/cambios/005-conexion-postgresql-local.md` (nota agregada)

## Contexto
El script `scripts/setup-postgres.sh` aprovisionaba PostgreSQL **desde cero** (instalaba PostGIS,
inicializaba el clúster, arrancaba el servicio y creaba rol/base). Era una solución **específica de
Arch Linux** y para una **única ocasión**.

El proyecto debe poder llevarse a **Windows** y en general debe **conectarse a una base de datos que
ya existe**, sin crear el motor, el rol ni la base desde el proyecto. La creación del esquema
(tablas, extensiones) sigue siendo responsabilidad de **Flyway**, pero eso ocurre *dentro* de una
base ya provista.

## Qué se hizo
1. **Se eliminó `scripts/setup-postgres.sh`** y la carpeta `scripts/`. Fue un aprovisionamiento
   puntual de esta máquina y no forma parte del flujo del proyecto.
2. **Se creó `.env.example`** en la raíz: plantilla con todas las variables de entorno que acepta
   el backend (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ORS_API_KEY`, `MAIL_*`, etc.).
3. **`.gitignore`**: se agregó `.env` y `.env.local` (y se exceptúa `.env.example`), para no subir
   credenciales reales.

## Cómo conectar a una base existente
Basta con indicar la conexión; **no** se crea nada del motor. Toda la configuración está en
`backend/src/main/resources/application.yml` (perfil `dev`) y admite variables de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_URL` | JDBC de la base existente | `jdbc:postgresql://servidor:5432/bicisafe` |
| `DB_USERNAME` | Usuario | `user` |
| `DB_PASSWORD` | Contraseña | `1234` |

Equivalentes por sistema operativo:
```bash
# Linux / macOS
export DB_URL="jdbc:postgresql://localhost:5432/bicisafe"
export DB_USERNAME=user
export DB_PASSWORD=1234
```
```bat
:: Windows CMD
set DB_URL=jdbc:postgresql://localhost:5432/bicisafe
set DB_USERNAME=user
set DB_PASSWORD=1234
```
```powershell
# Windows PowerShell
$env:DB_URL = "jdbc:postgresql://localhost:5432/bicisafe"
$env:DB_USERNAME = "user"
$env:DB_PASSWORD = "1234"
```
También se pueden editar directamente los valores por defecto del perfil `dev` en `application.yml`.

## Por qué
- El aprovisionamiento de infraestructura (crear el servidor/rol/base) **no pertenece al código de
  la aplicación**: depende del entorno y del sistema operativo. Mantenerlo en el repo lo volvía
  poco portable (código Arch + `sudo`/`systemctl`).
- Separar **conexión** (configuración de la app) de **aprovisionamiento** (una tarea de entorno)
  hace que el proyecto funcione igual en Linux, Windows o un proveedor gestionado (Render, Neon,
  Supabase…).
- `application.yml` ya usaba variables de entorno con valores por defecto solo en `dev`; se
  documentaron para que conectar a otra base sea cambiar tres valores.

## Notas / pendientes
- `docker-compose.yml` (cambio 003) sigue disponible como **opción opcional** para levantar PostGIS
  local con Docker (funciona igual en Windows con Docker Desktop); no es necesaria si ya hay una
  base existente.
- Flyway sigue aplicando las migraciones (`V1__...`) dentro de la base existente. Si la base ya
  tiene tablas y no tiene historial de Flyway, revisar `spring.flyway.baseline-on-migrate`.
- La migración `V1` hace `CREATE EXTENSION IF NOT EXISTS postgis`; en bases gestionadas puede
  requerir habilitar PostGIS desde el panel del proveedor.
