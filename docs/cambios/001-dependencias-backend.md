# 001 — Dependencias del backend

## Fecha
2026-10-17

## Archivos
- `backend/pom.xml` (modificado)

## Qué se hizo
Se añadieron las dependencias necesarias para cubrir el stack del backend (Spring Boot + JWT +
PostgreSQL/PostGIS + correlación de datos + caché + correo + documentación) y se configuró el
procesamiento de anotaciones de Lombok y MapStruct.

Dependencias agregadas:

| Área | Artefacto | Versión | Notas |
|------|-----------|---------|-------|
| Validación | `spring-boot-starter-validation` | gestionada | Bean Validation (`jakarta.validation`) en DTOs. |
| Seguridad | `spring-boot-starter-security` | gestionada | Cadena de filtros, BCrypt, base para RBAC. |
| JWT | `io.jsonwebtoken:jjwt-api` | 0.13.0 | API de JWT. |
| JWT | `io.jsonwebtoken:jjwt-impl` | 0.13.0 | Implementación (runtime). |
| JWT | `io.jsonwebtoken:jjwt-jackson` | 0.13.0 | (De)serialización JSON de claims (runtime). |
| Persistencia | `spring-boot-starter-data-jpa` | gestionada | Spring Data JPA + Hibernate. |
| Persistencia | `org.postgresql:postgresql` | 42.7.13 (gestionada) | Driver PostgreSQL (runtime). |
| Geoespacial | `org.hibernate.orm:hibernate-spatial` | 7.4.5.Final (gestionada) | Mapeo de geometrías PostGIS. |
| Migraciones | `org.flywaydb:flyway-core` | 12.4.0 (gestionada) | Versionado de esquema. |
| Migraciones | `org.flywaydb:flyway-database-postgresql` | 12.4.0 (gestionada) | Soporte Flyway para PostgreSQL. |
| Caché | `spring-boot-starter-cache` | gestionada | Abstracción de caché. |
| Caché | `com.github.ben-manes.caffeine:caffeine` | 3.2.4 (gestionada) | Implementación en memoria. |
| Correo | `spring-boot-starter-mail` | gestionada | Envío vía Gmail SMTP. |
| OpenAPI | `org.springdoc:springdoc-openapi-starter-webmvc-ui` | 3.1.1 | Swagger UI + `/v3/api-docs`. |
| Utilidades | `org.projectlombok:lombok` | 1.18.46 (gestionada, opcional) | Reducción de boilerplate. |
| Utilidades | `org.mapstruct:mapstruct` | 1.6.3 | Mapeo Entity ↔ DTO. |
| Pruebas | `spring-security-test` | gestionada | Utilidades de test para seguridad. |
| Pruebas | `com.h2database:h2` | gestionada | Base en memoria para tests. |

También se configuró `maven-compiler-plugin` con `annotationProcessorPaths` (Lombok,
`mapstruct-processor` y `lombok-mapstruct-binding:0.2.0`) y se excluyó Lombok del JAR final
en `spring-boot-maven-plugin`.

## Por qué
- El BOM de `spring-boot-starter-parent` 4.1.1 ya gestiona PostgreSQL, Flyway, Caffeine,
  Hibernate (incluido `hibernate-spatial`), Lombok y H2, así que **no se fijan versiones** para
  esos artefactos: se evita el desajuste de versiones y se facilita actualizar Spring Boot.
- **jjwt**, **springdoc** y **mapstruct** no están en el BOM de Boot, por eso llevan versión
  explícita. `jjwt` va partido en `api` (compilación) + `impl`/`jackson` (runtime), patrón
  recomendado por el proyecto.
- `hibernate-spatial` es obligatorio para mapear columnas `geometry` de PostGIS a tipos JPA.
- Lombok y MapStruct generan código en tiempo de compilación y **deben** declararse como
  *annotation processors*; sin `annotationProcessorPaths` no se ejecutan con Maven. El
  `lombok-mapstruct-binding` es necesario cuando ambos coexisten (si no, MapStruct no ve los
  getters/setters generados por Lombok).

## Notas / pendientes
- `springdoc` 3.x es la rama compatible con Spring Boot 4 (la 2.x apuntaba a Boot 3).
- MapStruct queda listo pero aún sin mappers escritos.
- **Corrección posterior (ver [006](006-fix-flyway-health.md))**: `flyway-core` por sí solo no activa
  la autoconfiguración en Boot 4; se reemplazó por `spring-boot-starter-flyway`.
