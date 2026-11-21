# BiciSafe

Plataforma web para ciclistas urbanos en Lima. Permite planificar rutas seguras por ciclovías, reportar incidencias viales y validarlas mediante consenso comunitario.

## Requisitos

- **Java 21**
- **Node.js 18+** y npm
- **PostgreSQL** con extensión **PostGIS**

## Ejecutar el proyecto

### 1. Base de datos

Puedes levantar PostgreSQL con PostGIS usando Docker:

```bash
docker compose up -d
```

O conectar a una base de datos local existente con el nombre `bicisafe`.

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

El servicio estará disponible en `http://localhost:8080`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación web iniciará en `http://localhost:3000`.

## Pruebas

- **Backend**:
  ```bash
  cd backend && ./mvnw test
  ```
- **Frontend**:
  ```bash
  cd frontend && npm test
  ```

## Estructura

- `backend/`: API REST en Spring Boot (Spring Security, JWT, Spring Data JPA, Flyway).
- `frontend/`: Aplicación SPA en React con TypeScript, Vite, Tailwind CSS y Leaflet.
