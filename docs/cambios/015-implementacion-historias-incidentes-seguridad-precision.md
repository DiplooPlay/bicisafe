# 015 - Implementación de historias de incidentes, consenso, seguridad y precisión GPS

**Fecha:** 2026-10-17  
**Archivos afectados:**
- `backend/src/main/resources/db/migration/V3__incidente_y_votos.sql`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/CategoriaIncidente.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/EstadoIncidente.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/Incidente.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/dto/IncidenteRequest.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/dto/IncidenteResponse.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/repository/IncidenteRepository.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/service/IncidenteService.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/service/IncidenteServiceImpl.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/controller/IncidenteControlador.java`
- `backend/src/test/java/pe/edu/untels/bicisafe/incidente/IncidenteServiceTest.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/ConfiguracionSeguridad.java`
- `backend/src/main/resources/application.yml`
- `frontend/src/hooks/useGeolocalizacion.ts`
- `frontend/src/services/incidenteService.ts`
- `frontend/src/components/mapa/MapaInteractivo.tsx`
- `frontend/src/App.tsx`
- `historias-pendientes/README.md`
- `docs/cambios/013-implementacion-historias-incidentes-seguridad-precision.md`
- `docs/cambios/README.md`

## Qué se hizo

1. **Seguridad y Credenciales (HU5):**
   - Se configuró `new BCryptPasswordEncoder(10)` en [ConfiguracionSeguridad.java](file:///home/diploo/Proyectos/bicisafe/backend/src/main/java/pe/edu/untels/bicisafe/config/security/ConfiguracionSeguridad.java).
   - Se ajustó la expiración del token JWT a **24 horas (1440 minutos)** en [application.yml](file:///home/diploo/Proyectos/bicisafe/backend/src/main/resources/application.yml).
   - Se habilitaron las rutas públicas para lectura de incidentes activos (`/api/incidentes/**`).
2. **Módulo Backend de Incidentes y Consenso (E3 - HU1, HU2, HU3, HU4):**
   - Migración Flyway `V3__incidente_y_votos.sql` con tipo espacial PostGIS `geometry(Point, 4326)` e índices GIST.
   - Entidad JPA `Incidente` con lógica de dominio para consenso de votos (`confirmarVoto`, `marcarResuelto`).
   - DTOs con validación estricta Bean Validation (`@Size(max=120)` para descripción).
   - Servicio transaccional `IncidenteServiceImpl` y controlador delgado `IncidenteControlador`.
   - Pruebas unitarias completas en `IncidenteServiceTest` (todas pasando, 26 tests en verde).
3. **Precisión de Geolocalización (Pendiente resuelto):**
   - Hook [useGeolocalizacion.ts](file:///home/diploo/Proyectos/bicisafe/frontend/src/hooks/useGeolocalizacion.ts) con `{ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }`.
   - Cálculo del margen de error en metros (`accuracy`) y badge en el HUD del mapa.
4. **Visualización y Acciones en Mapa (HU1, HU3, HU4, HU6):**
   - Capa de OpenStreetMap sin marcas de agua.
   - Marcadores interactivos por categoría de incidente con drawer inferior de detalle.
   - Acciones de "Confirmar (+1 voto)" y "Ya no existe / Resuelto" (retiro inmediato del mapa).
   - Controles de zoom dedicados (+ / -) y recentrado de GPS.
   - Resiliencia ante caída del servicio de rutas manteniendo mapa e incidentes 100% funcionales.

## Por qué se tomó esta decisión

Se implementaron todos los criterios de aceptación alineados estrictamente con los estándares de arquitectura modular, YAGNI y legibilidad especificados en el `README.md` del proyecto.
