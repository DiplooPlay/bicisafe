# 004 — Configuración de pruebas

## Fecha
2026-10-17

## Archivos
- `backend/src/test/resources/application.yml` (creado)

## Qué se hizo
Se creó una configuración de Spring Boot para el classpath de pruebas que:
- Usa una base **H2 en memoria** en modo PostgreSQL (`jdbc:h2:mem:bicisafe;MODE=PostgreSQL`).
- **Desactiva Flyway** en tests (`spring.flyway.enabled: false`).
- Define un `JWT_SECRET` de prueba y `ddl-auto: none`.

Se agregó la dependencia `com.h2database:h2` (scope `test`) en `backend/pom.xml`.

## Por qué
- Al incorporar JPA + Flyway, el test `BiciSafeApplicationTests.contextLoads` intentaría conectarse
  a PostgreSQL al levantar el contexto. Sin una base disponible, el build fallaría.
- La configuración de `src/test/resources/application.yml` tiene **prioridad** sobre
  `src/main/resources/application.yml` (va primero en el classpath), por lo que los tests quedan
  **autocontenidos**: no requieren Docker ni una base externa y se ejecutan en cualquier CI.
- **Se desactiva Flyway** en tests porque la migración `V1` ejecuta `CREATE EXTENSION postgis`, que
  H2 no soporta. Como todavía no hay entidades, no hace falta crear tablas.
- Aún no hay código que lea `app.jwt.secret`, pero se define para que el arranque sea completo y
  quede listo cuando se implemente la seguridad.

## Notas / pendientes
- Cuando existan entidades/repositorios con columnas `geometry`, conviene migrar las pruebas de
  integración a **Testcontainers** con la imagen `postgis/postgis` para probar contra PostGIS real.
- Las pruebas unitarias puras (sin contexto Spring) no necesitan esta configuración.
