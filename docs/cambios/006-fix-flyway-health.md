# 006 — Corrección: arranque de Flyway y health de la BD

## Fecha
2026-10-17

## Archivos
- `backend/pom.xml` (modificado)
- `backend/src/main/resources/application.yml` (modificado — perfil `dev`)

## Contexto
Al levantar el backend contra PostgreSQL local se detectaron dos problemas:

1. **Flyway no se ejecutaba**: no se creaba `flyway_schema_history` ni aparecía ningún log de
   migración. El cambio 001 había declarado `flyway-core`, pero en Spring Boot 4 la
   **autoconfiguración** de Flyway vive en el módulo `spring-boot-flyway`, que no se incluía con
   `flyway-core`.
2. **`/actuator/health` devolvía `DOWN`**: la causa no era la base de datos (Hikari conectaba bien)
   sino el `MailHealthIndicator`, que fallaba con
   `AuthenticationFailedException: failed to connect, no password specified?` porque aún no hay
   credenciales de Gmail SMTP configuradas.

## Qué se hizo

### `pom.xml`
Se reemplazó la dependencia suelta `org.flywaydb:flyway-core` por el starter de Boot 4:
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```
`spring-boot-starter-flyway` trae `spring-boot-flyway` (autoconfig), `spring-boot-starter-jdbc` y
`flyway-core`. Se mantiene `flyway-database-postgresql` para el dialecto PostgreSQL de Flyway 12.

### `application.yml` (perfil `dev`)
```yaml
management:
  health:
    mail:
      enabled: false
```

## Por qué
- Sin el módulo `spring-boot-flyway` no hay `FlywayAutoConfiguration` en el classpath, por lo que
  Spring Boot nunca invocaba a Flyway. En Boot 4 la autoconfiguración está modularizada: cada
  tecnología se activa con su propio starter.
- El check de mail es un *health indicator* opcional. Como la mensajería todavía no se implementa y
  no hay credenciales, se desactiva **solo en `dev`** para que el `health` refleje el estado real de
  la aplicación (BD, disco, etc.) sin un falso `DOWN`. En `prod`, cuando existan las credenciales,
  el check seguirá activo.

## Verificación
Tras reconstruir (`./mvnw clean package`) y arrancar el jar:
```
Database: jdbc:postgresql://localhost:5432/bicisafe (PostgreSQL 18.6)
Successfully applied 1 migration to schema "public", now at version v1
Started BiciSafeApplication ...
GET /actuator/health -> {"status":"UP"}
```
Comprobado en la base:
```
flyway_schema_history: version=1, description=habilita postgis, success=t
pg_extension: postgis, uuid-ossp
```

## Notas / pendientes
- Este cambio **corrige** lo indicado en el cambio 001 (que listaba `flyway-core`).
- Si en `prod` se quiere que el `health` no dependa del SMTP, se puede desactivar también allí.
