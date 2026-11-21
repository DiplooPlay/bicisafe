# 025 · Corrección de mapeo en perfil, captura de error en denuncia y unificación de URL API

## Fecha
2026-11-20

## Archivos modificados y creados

### Frontend
- `frontend/src/services/incidenteService.ts`: exportación de `mapDtoToIncident` y `normalizarEstado`, unificación de `BASE_URL` soportando `VITE_API_URL` y comprobación de `res.ok` en `denunciarIncidenteApi`.
- `frontend/src/services/auth.ts`: transformación explícita de `historialReportes` en `obtenerPerfilCompleto` con `mapDtoToIncident`.
- `frontend/src/components/mapa/MapaInteractivo.tsx`: exclusión explícita de `EXPIRED` en filtro de ruta.
- `frontend/src/services/incidenteService.test.ts`: prueba unitaria validando que `denunciarIncidenteApi` rechace con error ante HTTP 400.
- `frontend/src/pages/Perfil.test.tsx`: suite unitaria validando mapeo `titulo` → `title` y `estado` → `status` y renderizado en pantalla.

---

## Qué se hizo

1. **HU-04 (Mapeo de historial de reportes)**: Se conectó `mapDtoToIncident` en `obtenerPerfilCompleto`, garantizando que títulos, ubicaciones y estados de los incidentes propios se muestren correctamente en la pantalla de Perfil.
2. **HU-14 (Propagación de error en denuncia duplicada)**: Se corrigió `denunciarIncidenteApi` para validar `res.ok` y rechazar con el mensaje del backend cuando se intenta denunciar un incidente previamente reportado.
3. **Unificación de URL base de la API**: `incidenteService.ts` ahora respeta `VITE_API_URL` alineado con `api.ts`, asegurando consistencia en entornos de despliegue.
4. **Filtro de mapa**: Se agregó descarte explícito de incidentes `EXPIRED` en el modo de visualización de ruta.

---

## Cómo se verificó

- **Backend**: `./mvnw test` ejecutó 55 pruebas sin fallos.
- **Frontend**: `npm test` ejecutó 8 archivos de prueba (13 tests en total) al 100% en verde.
- **Build**: `npm run build` completado con éxito.
