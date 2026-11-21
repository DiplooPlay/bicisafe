# BiciSafe

Plataforma de **ciclorutas seguras y reporte comunitario** para Lima Sur. Permite planificar rutas
en bicicleta, reportar y validar incidencias de forma comunitaria, y administrar los parámetros del
sistema. El proyecto está organizado como un **monolito modular**.

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Java 21, Spring Boot 4.1.1, Maven, Spring Security + JWT, Spring Data JPA, Flyway |
| Base de datos | PostgreSQL + PostGIS |
| Caché | Caffeine |
| API docs | springdoc OpenAPI (Swagger UI) |
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Leaflet |
| Servicios externos | OpenRouteService, OpenStreetMap (tiles/Nominatim), Gmail SMTP |
| Infra / CI | Docker Compose (opcional), GitHub Actions, despliegue en Render |

## Cómo ejecutar

Requisitos: **JDK 21**, **Node 18+** y una **base PostgreSQL con PostGIS** (existente o vía
`docker compose up -d`). La configuración de conexión se toma de variables de entorno (ver
`.env.example`); por defecto en `dev` apunta a `jdbc:postgresql://localhost:5432/bicisafe`.

### Linux

```bash
# Backend (aplica migraciones Flyway al arrancar)
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm install && npm run dev
```

### Windows

```bat
:: Backend (usa el wrapper .cmd)
cd backend
mvnw.cmd spring-boot:run

:: Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores, o defínelos en el sistema:

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

Variables principales: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ORS_API_KEY`,
`MAIL_*`. Detalle de cada una en `.env.example`. Spring Boot **no** lee `.env`: defínelo como variables del sistema/IDE.
