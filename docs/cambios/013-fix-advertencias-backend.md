# 013 — Correcciones de advertencias del análisis estático

## Fecha
2026-10-17

## Archivos
- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/JwtAutenticacionFiltro.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/repository/IncidenteRepository.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/integracion/osm/NominatimAdapter.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/service/ProveedorRutas.java`
- `backend/src/test/java/pe/edu/untels/bicisafe/incidente/IncidenteServiceTest.java`

## Qué se hizo
Se corrigieron las advertencias reportadas por el Language Server de Java:

| Archivo | Problema | Corrección |
|---------|----------|------------|
| `JwtAutenticacionFiltro` | `Illegal redefinition of parameter` + `NonNull is deprecated since 7.0` | Se quitaron las anotaciones `@NonNull` (y su import) de los parámetros de `doFilterInternal`. |
| `IncidenteRepository` | `Unnecessary @Repository` | Se quitó `@Repository` y su import. |
| `NominatimAdapter` | `asText(...) is deprecated` (3 usos) | Se reemplazó por `asString(...)`. |
| `ProveedorRutas` | `import java.util.List is never used` | Se eliminó el import. |
| `IncidenteServiceTest` | `ArgumentCaptor` y `verify` nunca usados | Se eliminaron ambos imports. |

## Por qué
- **`@NonNull` (Spring 7)**: `org.springframework.lang.NonNull` está **deprecado desde Spring
  Framework 7** (ahora se usa JSpecify). Además, anotar un parámetro que el método heredado no anota
  genera el error *"Illegal redefinition of parameter"* en el análisis de nulos de ECJ. Basta con
  quitar las anotaciones: `HttpServletRequest`/`HttpServletResponse`/`FilterChain` en un filtro
  nunca son `null`.
- **`@Repository` en interfaces de Spring Data**: los repositorios de Spring Data JPA se detectan y
  registran automáticamente; la anotación es redundante (el plugin de Spring Boot la marca como
  innecesaria).
- **`JsonNode.asText()` → `asString()`**: la aplicación usa **Jackson 3** (`tools.jackson.databind`);
  en esta versión `asText()` quedó **deprecado** en favor de `asString()`.
- **Imports sin usar**: eliminan ruido y posibles confusions; forman parte del estándar de código
  (ver cambio [012](012-estandares-codigo-readme.md)).

## Verificación
```
./mvnw -q clean test-compile   -> EXIT=0
./mvnw -q test                 -> EXIT=0 (incluye pruebas ArchUnit)
```

## Notas / pendientes
- Se mantienen como advertencias informativas (no del código): el caché Caffeine no registra
  estadísticas (`Caffeine#recordStats()`) y el uso de Mockito como agente dinámico. Se pueden atender
  en otro cambio si se desea (son mejoras, no errores).
