# 014 - Implementación de interfaces frontend para historias de usuario

**Fecha:** 2026-10-17  
**Archivos afectados:**
- `frontend/src/types/index.ts`
- `frontend/src/services/mockData.ts`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/layout/BottomNav.tsx`
- `frontend/src/components/rutas/PlanificadorRuta.tsx`
- `frontend/src/components/mapa/MapaInteractivo.tsx`
- `frontend/src/components/incidentes/ReportarIncidenciaModal.tsx`
- `frontend/src/components/incidentes/ValidarIncidentes.tsx`
- `frontend/src/App.tsx`
- `frontend/src/styles/index.css`
- `docs/cambios/007-interfaces-historias-usuario-frontend.md`
- `docs/cambios/README.md`

## Qué se hizo

Se desarrollaron e integraron en el frontend los componentes basados fielmente en los prototipos de Google Stitch (`velo_kinetic`), mapeando las 9 historias de usuario solicitadas:

1. **Escribir origen o destino en Lima:** Componente [PlanificadorRuta.tsx](file:///home/diploo/Proyectos/bicisafe/frontend/src/components/rutas/PlanificadorRuta.tsx) con soporte para búsqueda libre y puntos emblemáticos de Lima (UNTELS, Miraflores, San Isidro, Surco, Chorrillos, Jesús María, Centro Histórico).
2. **Ubicación actual como origen:** Botón "Usar mi GPS" en el planificador que activa `navigator.geolocation` y fija la posición del ciclista.
3. **Calcular ruta, distancia y tiempo:** Renderizado del trayecto en polilínea con Leaflet, tarjeta de resumen con distancia en kilómetros, tiempo estimado en minutos (~15 km/h) y porcentaje de ruta protegida.
4. **Ver mapa de incidentes:** Componente [MapaInteractivo.tsx](file:///home/diploo/Proyectos/bicisafe/frontend/src/components/mapa/MapaInteractivo.tsx) con marcadores vectoriales en Leaflet para baches, obras, bloqueos e iluminación deficiente, además de filtros por categorías (*Todo, Segregadas, Vías 30, Alertas*).
5. **Reportar incidente:** Componente [ReportarIncidenciaModal.tsx](file:///home/diploo/Proyectos/bicisafe/frontend/src/components/incidentes/ReportarIncidenciaModal.tsx) con el asistente de 5 pasos extraído de Stitch (categoría, ubicación con fijación en mapa, detalle con contador 0/120 caracteres, subida de foto y confirmación).
6. **Confirmar incidente:** Acción comunitaria en el mapa y en el panel [ValidarIncidentes.tsx](file:///home/diploo/Proyectos/bicisafe/frontend/src/components/incidentes/ValidarIncidentes.tsx) que suma votos de confirmación al consenso requerido y otorga puntos de reputación (+2).
7. **Indicar que un incidente ya no existe:** Acción "Ya no existe / Resuelto" que actualiza el estado a `RESOLVED` y retira el marcador del mapa activo.
8. **Protección de credenciales:** Vista de [Login.tsx](file:///home/diploo/Proyectos/bicisafe/frontend/src/pages/Login.tsx) con alternancia para ocultar contraseña, badges de seguridad cifrada y autenticación de ciclista.
9. **Resiliencia ante caída del servicio de rutas:** Manejo desacoplado donde la falla del servicio de rutas muestra una alerta no intrusiva mientras el mapa y la capa de incidentes se mantienen 100% interactivos y disponibles.

## Por qué se tomó esta decisión

Se adaptaron los prototipos visuales de Stitch a componentes modulares de React y Leaflet, manteniendo el backend totalmente aislado y sin modificaciones, y asegurando una cobertura interactiva completa para cada historia de usuario.
