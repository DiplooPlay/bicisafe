# Registro de cambios

Esta carpeta documenta cada cambio técnico hecho por el equipo/asistente en BiciSafe.
Cada archivo describe **qué** se cambió, **la ruta exacta** de los archivos afectados y **por qué**
se tomó esa decisión, para que cualquiera pueda reconstruir el historial sin leer todo el código.

## Convención

- Un archivo por cambio lógico: `NNN-titulo-corto.md` (numeración incremental).
- Secciones fijas: **Fecha**, **Archivos**, **Qué se hizo**, **Por qué**, **Notas / pendientes**.
- Si un cambio se revierte, se agrega un nuevo documento (no se borra el anterior).

### Cierre de historias pendientes (`docs/historias-pendientes/`)

Cuando **todos** los pendientes de una historia de `docs/historias-pendientes/`
queden resueltos:

1. **Eliminar** el archivo `e{epico}-{tema}.md` de esa carpeta y **quitar su
   fila** del índice de su `README.md`. No debe quedar rastro de historias
   resueltas en esa carpeta.
2. **Documentar el cierre aquí**, en esta carpeta, con un documento nuevo
   (`NNN-cierre-historia-x.md`, siguiente número disponible) que incluya:
   - **Qué estaba pendiente** y **por qué** (link a la historia del README raíz).
   - **Cómo se resolvió**: archivos creados/modificados, decisiones, dependencias.
   - **Cómo se verificó**: comandos corridos, resultados/evidencia (ej. salida
     de `mvn test`, `curl`, `npm run build`).
   - **Fecha** del cierre.
3. El índice de este README debe referenciar el nuevo documento.

Si la historia solo quedó **parcialmente** resuelta, NO se elimina su archivo:
se documenta la parte resuelta en un documento de esta carpeta y el ítem
correspondiente se tacha (con fecha) dentro del archivo de la historia, que
permanece en `docs/historias-pendientes/` hasta que todo quede resuelto.

## Índice

| # | Documento | Resumen |
|---|-----------|---------|
| 001 | [001-dependencias-backend.md](001-dependencias-backend.md) | Dependencias del backend en `pom.xml` (JPA, PostGIS, Security/JWT, Flyway, caché, correo, OpenAPI, Lombok/MapStruct). |
| 002 | [002-perfiles-configuracion.md](002-perfiles-configuracion.md) | `application.yml` con perfiles dev/prod y variables de entorno. |
| 003 | [003-postgis-docker-flyway.md](003-postgis-docker-flyway.md) | `docker-compose.yml` con PostGIS y migración Flyway inicial. |
| 004 | [004-configuracion-pruebas.md](004-configuracion-pruebas.md) | Configuración de pruebas (H2 + Flyway off) para mantener el build verde. |
| 005 | [005-conexion-postgresql-local.md](005-conexion-postgresql-local.md) | Aprovisionamiento de PostgreSQL local (PostGIS, rol `user`, base `bicisafe`). |
| 006 | [006-fix-flyway-health.md](006-fix-flyway-health.md) | Corrección: starter `spring-boot-starter-flyway` y health de BD (desactivar check de mail en dev). |
| 007 | [007-configuracion-bd-portable.md](007-configuracion-bd-portable.md) | Configuración portable: se elimina el script de aprovisionamiento y se documenta la conexión a una base existente. |
| 008 | [008-descompresion-stitch-y-plan-frontend.md](008-descompresion-stitch-y-plan-frontend.md) | Descompresión de prototipos de Google Stitch y plan de implementación frontend en React + Leaflet. |
| 009 | [009-frontend-inicio-sesion.md](009-frontend-inicio-sesion.md) | Configuración inicial del frontend (Vite + React + TS + Tailwind) e implementación de la pantalla de Inicio de Sesión. |
| 010 | [010-ignorar-stitch-en-git.md](010-ignorar-stitch-en-git.md) | Se agrega `stitch_cicloruta_mvp_web/` al `.gitignore` (prototipos de diseño no versionables). |
| 011 | [011-readme-arquitectura.md](011-readme-arquitectura.md) | README raíz del proyecto con el patrón arquitectónico (monolito modular) y la estructura. |
| 012 | [012-estandares-codigo-readme.md](012-estandares-codigo-readme.md) | Sección "Estándares de código" en el README (clean code, comentarios útiles, convenciones). |
| 013 | [013-fix-advertencias-backend.md](013-fix-advertencias-backend.md) | Corrección de advertencias: `@NonNull` deprecado, `@Repository` innecesario, `asText`→`asString` e imports sin usar. |
| 013 | [013-auth-rutas-monolito.md](013-auth-rutas-monolito.md) | Implementación de E1 (registro con verificación por correo, login/logout JWT) y E2 (búsqueda de lugares, GPS, rutas ORS/Nominatim) con puertos y adaptadores, ArchUnit y pruebas en verde. |
| 014 | [014-credenciales-correo-verificacion.md](014-credenciales-correo-verificacion.md) | Credenciales reales de Gmail SMTP en `.env`, envío real del correo de verificación y cálculo de ruta ORS verificados de extremo a extremo; log de éxito en el adapter. |
| 014 | [014-interfaces-historias-usuario-frontend.md](014-interfaces-historias-usuario-frontend.md) | Implementación de componentes frontend (React + Leaflet) para las historias de usuario. |
| 015 | [015-implementacion-historias-incidentes-seguridad-precision.md](015-implementacion-historias-incidentes-seguridad-precision.md) | Implementación completa de historias de incidentes, consenso comunitario, BCrypt/JWT y precisión GPS. |
| 016 | [016-politica-cierre-historias-pendientes.md](016-politica-cierre-historias-pendientes.md) | Política de cierre: parcial resuelto se tacha con link al cambio; historia 100% resuelta se elimina de `docs/historias-pendientes/` y el cierre se documenta aquí (qué estaba pendiente, cómo se arregló, cómo se verificó). |
| 017 | [017-cierre-hu-inicio-sesion-y-busqueda-lugares.md](017-cierre-hu-inicio-sesion-y-busqueda-lugares.md) | Cierre definitivo de HU E1 Inicio de sesión y HU E2 Búsqueda de lugares; logout backend con lista negra, suite Vitest/Testing Library y registro de intentos en pendientes abiertos. |
| 018 | [018-seguridad-incidentes-y-sesion-frontend.md](018-seguridad-incidentes-y-sesion-frontend.md) | Correcciones al cierre del 017: escritura de incidentes solo con JWT (GET público), jti único contra colisión de lista negra del logout, y fusión de la sesión E1 en `App.tsx`; verificado con curl, `mvn test`, `npm build` y Vitest. |
| 019 | [019-fix-cors-rutas-verificacion-y-guia-despliegue.md](019-fix-cors-rutas-verificacion-y-guia-despliegue.md) | Fix CORS puerto 3000, debounce y auto-resolución en Planificador, mensaje guiado por vía inaccesible en OrsAdapter, corrección de FRONTEND_URL en emails y guía de despliegue a producción. |
| 020 | [020-resaltado-ciclovias-cyclosm-y-geometria-real.md](020-resaltado-ciclovias-cyclosm-y-geometria-real.md) | Resaltado realista de ciclovías por calzada (sin cortar manzanas), capa base CyclOSM con toggle y delimitación geográfica a Lima Metropolitana y Villa El Salvador. |
| 021 | [021-filtro-ruta-y-resaltado-alto-contraste.md](021-filtro-ruta-y-resaltado-alto-contraste.md) | Filtro de Ruta planificada en barra superior, trazo naranja deportivo de alto contraste con halo blanco, marcadores de origen/meta y centrado automático `fitBounds`. |


