# Cambio 017: Cierre de historias de usuario (Inicio de sesión y Búsqueda de lugares) y política de registro de intentos

## Fecha

2026-10-17

## Archivos

- `docs/historias-pendientes/README.md` (regla de anotar lo que se intentó y actualización del índice).
- `docs/historias-pendientes/e1-inicio-sesion.md` (eliminado por resolución del 100% de pendientes).
- `docs/historias-pendientes/e2-busqueda-lugares.md` (eliminado por resolución del 100% de pendientes).
- `docs/historias-pendientes/e2-gps-origen.md` (actualizado con lo implementado, lo pendiente y lo que se intentó).
- `docs/historias-pendientes/e2-planificacion-ruta.md` (actualizado con lo implementado, lo pendiente y lo que se intentó).
- `docs/historias-pendientes/e1-registro-ciclista.md` (actualizado con lo implementado, lo pendiente y lo que se intentó).
- `backend/src/main/resources/application.yml` (propiedad `app.busqueda.limite-resultados: ${BUSQUEDA_LIMITE_RESULTADOS:6}`).
- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/JwtServicio.java` (lista negra de tokens para logout en backend).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/service/ServicioAutenticacion.java` (firma `cerrarSesion(token)`).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/service/ServicioAutenticacionImpl.java` (invalidación del token).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/controller/AutenticacionControlador.java` (endpoint `POST /api/auth/logout`).
- `backend/src/test/java/pe/edu/untels/bicisafe/auth/AutenticacionServiceImplTest.java` (prueba unitaria de invalidación de token).
- `frontend/package.json` (instalación de `vitest@2`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` y script `test`).
- `package.json` (script raíz `test`).
- `frontend/vite.config.ts` (bloque de configuración `test` con jsdom).
- `frontend/src/setupTests.ts` (import de matchers `@testing-library/jest-dom`).
- `frontend/src/services/lugares.test.ts` (prueba unitaria del servicio de búsqueda).
- `frontend/src/components/rutas/PlanificadorRuta.test.tsx` (prueba de componente del planificador).
- `frontend/src/hooks/useGeolocalizacion.test.ts` (prueba unitaria del hook de geolocalización satelital y permisos).
- `frontend/src/services/auth.ts` (función `cerrarSesionApi(token)` conectada a `POST /api/auth/logout`).
- `frontend/src/context/SesionContext.tsx` (invocación al backend al ejecutar `cerrarSesion`).

## Qué se hizo

1. **Cierre de la HU E1 (Inicio de sesión del ciclista)**:
   - Los pendientes eran la integración con las funciones de reporte/validación comunitarias (E3) y el logout en backend.
   - Las funciones de reporte, confirmación (+1 voto) y resolución (-1 voto / retiro del mapa) ya quedaron implementadas en el módulo `incidente` con persistencia PostGIS.
   - Se implementó el logout en backend: `JwtServicio` mantiene un conjunto concurrente de tokens invalidados (`tokensInvalidados`). El endpoint `POST /api/auth/logout` invalida el token recibido en el encabezado `Authorization: Bearer <token>`.
   - Se conectó `SesionContext` en el frontend para notificar a la API antes de limpiar el almacenamiento local.
   - Se verificó con prueba unitaria en `AutenticacionServiceImplTest`.
   - Al no quedar ningún pendiente, se **eliminó** `e1-inicio-sesion.md` de `docs/historias-pendientes/`.

2. **Cierre de la HU E2 (Búsqueda de lugares de destino)**:
   - Los pendientes eran la ausencia de dependencias de pruebas de UI (`vitest` + `testing-library`) y la exposición de `app.busqueda.limite-resultados` en `application.yml`.
   - Se instaló `vitest@^2.1.8`, `@testing-library/react`, `@testing-library/jest-dom` y `jsdom` compatibles con Vite 5.
   - Se configuró el runner de pruebas en `vite.config.ts` y se añadieron pruebas unitarias para `buscarLugares` y `PlanificadorRuta`.
   - Se expuso `app.busqueda.limite-resultados: ${BUSQUEDA_LIMITE_RESULTADOS:6}` en `application.yml`.
   - Al no quedar ningún pendiente, se **eliminó** `e2-busqueda-lugares.md` de `docs/historias-pendientes/`.

3. **Política de historias pendientes no resueltas**:
   - Se actualizó `docs/historias-pendientes/README.md` estipulando que si una historia no se puede resolver en su totalidad (por hardware físico móvil o alcance), debe permanecer en la carpeta con la sección **"Lo que se intentó"** documentando los enfoques técnicos ejecutados, resultados obtenidos y siguientes pasos.
   - Se actualizaron `e2-gps-origen.md`, `e2-planificacion-ruta.md` y `e1-registro-ciclista.md` bajo esta estructura.

## Cómo se verificó

- **Backend**:
  - Se ejecutó `./mvnw test` en `backend/`.
  - Resultado: **27 pruebas ejecutadas, 0 fallos, 0 errores**, incluyendo la nueva prueba de invalidación de JWT y las 3 reglas de arquitectura de ArchUnit (`ArquitecturaBiciSafeTest`).
- **Frontend**:
  - Se ejecutó `npm test` en `frontend/`.
  - Resultado: **3 archivos de prueba pasados, 4 pruebas exitosas** (`lugares.test.ts`, `PlanificadorRuta.test.tsx`, `useGeolocalizacion.test.ts`).
  - Se ejecutó `npm run build` en `frontend/`.
  - Resultado: Compilación con TypeScript y Vite finalizada en 1.3s con **0 errores y 0 warnings**.
