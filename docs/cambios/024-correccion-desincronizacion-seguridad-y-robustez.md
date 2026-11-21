# 024 · Corrección de desincronización de estados, seguridad de rutas y robustez de incidentes

## Fecha
2026-11-20

## Archivos modificados y creados

### Backend
- `backend/src/main/resources/db/migration/V3__incidente_y_votos.sql`: eliminación de texto espurio `23` en la migración SQL.
- `backend/src/main/java/pe/edu/untels/bicisafe/BiciSafeApplication.java`: adición de `@EnableScheduling` para habilitar el descarte periódico de incidentes expirados (HU-15).
- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/ConfiguracionSeguridad.java`: corrección en `RUTAS_PUBLICAS` para evitar colisión de `/api/rutas/**` con `/api/rutas/guardadas`, forzando autenticación rigurosa.
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/repository/IncidenteDenunciaRepository.java`: método `existsByIncidenteIdAndUsuarioId` para prevenir denuncias duplicadas.
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/service/IncidenteServiceImpl.java`: validación de reportes duplicados, reducción de reputación (-5) ante incidentes falsos reiterados y control de nulos en `expirarIncidentesVencidos`.
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/Incidente.java` e `IncidenteResponse.java`: protección ante valores nulos de `fechaExpiracion`.
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/controller/RutaGuardadaControlador.java` y `UsuarioControlador.java`: validación explícita de usuario autenticado contra llamadas anónimas.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/dto/RespuestaUsuario.java`: inclusión de `fechaRegistro` real del ciclista para la vista de perfil (HU-04).
- `backend/src/main/java/pe/edu/untels/bicisafe/integracion/ors/OrsAdapter.java`: verificación de elevación no nula en puntos del recorrido.
- Pruebas unitarias backend: `IncidenteServiceTest.java`, `RutaGuardadaControladorTest.java`, `UsuarioControladorTest.java`.

### Frontend
- `frontend/src/services/incidenteService.ts`: normalización bidireccional de estados de incidentes (`PENDIENTE` → `PENDING`, `EN_DISPUTA` → `DISPUTED`, `CONFIRMADO` → `CONFIRMED`, `EXPIRADO` → `EXPIRED`) y descarte de expirados en fallback.
- `frontend/src/components/mapa/MapaInteractivo.tsx`: filtrado real de incidentes dentro del corredor de la ruta cuando el chip "Ruta" está seleccionado (HU-09) y ocultamiento de incidentes expirados (HU-15).
- `frontend/src/App.tsx`: vinculación del estado `routeIncidents` entre el planificador y el mapa.
- `frontend/src/components/rutas/PlanificadorRuta.tsx`: notificación de incidentes en ruta al cargar rutas guardadas sin recalcular (HU-16).
- `frontend/src/components/rutas/PerfilElevacion.tsx`: soporte correcto para rutas llanas con 0 m de desnivel (HU-08).
- `frontend/src/components/incidentes/DenunciarIncidenteModal.tsx`: presentación de mensaje de error al usuario ante fallos o reportes duplicados.
- Pruebas unitarias frontend: `incidenteService.test.ts`, `PerfilElevacion.test.tsx`.

## Qué se hizo y Por qué

1. **Corrección de migración Flyway**: Se eliminó un carácter literal `23` insertado por error en `V3__incidente_y_votos.sql` que impedía el arranque en entornos con Flyway habilitado.
2. **Activación de `@EnableScheduling`**: El servicio de expiración periódica de incidentes (`@Scheduled` en `IncidenteServiceImpl`) requiere que la aplicación Spring Boot active el scheduler; de lo contrario, las tareas programadas nunca se ejecutan.
3. **Sincronización de estados de incidentes (Frontend/Backend)**: El backend devuelve estados en español (`PENDIENTE`, `EN_DISPUTA`, `CONFIRMADO`, etc.), mientras que los componentes frontend (`ValidarIncidentes`, `App`, `MapaInteractivo`) filtraban por `PENDING`, `DISPUTED`, `CONFIRMED`. Esto provocaba que todas las pestañas de validación aparecieran vacías al conectarse a la API. Se agregó la función `normalizarEstado` en el servicio frontend.
4. **Filtrado de incidentes sobre la ruta (HU-09)**: Se implementó el filtrado estricto en el mapa cuando el usuario selecciona la categoría "Ruta", asegurando que solo se visualicen incidentes dentro del corredor cercano (150 m) y ocultando los incidentes lejanos.
5. **Control de duplicados en moderación (HU-14)**: Se restringió que un mismo ciclista envíe reportes múltiples sobre el mismo incidente y se vinculó la deducción de 5 puntos de reputación al autor cuando el incidente es dado de baja por falsedad comprobada.
6. **Manejo de rutas planas en Perfil de Elevación (HU-08)**: Se corrigió la expresión `elevacionGanada || 33` que forzaba 33 m incluso en recorridos completamente planos con 0 m de desnivel.
7. **Fecha real de registro en perfil (HU-04)**: Se propagó la fecha real de creación de la cuenta en lugar de generar un timestamp instantáneo en cada petición.

## Cómo se verificó

1. **Backend**:
   - `mvn test`: 55 pruebas ejecutadas, 0 fallos, 0 errores.
   - Verificación de arquitectura y cobertura JaCoCo: **74.59%** de cobertura de instrucciones alcanzada (umbral RNF-06: ≥ 60%).
2. **Frontend**:
   - `npm test`: 7 archivos de prueba, 10 pruebas exitosas.
   - `npm run build`: compilación de TypeScript y empaquetado Vite completados sin errores.
