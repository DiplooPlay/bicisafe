# 026: Corrección de persistencia de incidentes, reputación dinámica y modal minimalista

## Fecha
2026-11-21

## Archivos
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/service/IncidenteServiceImpl.java`
- `frontend/src/App.tsx`
- `frontend/src/services/incidenteService.ts`
- `frontend/src/pages/Perfil.tsx`
- `frontend/src/components/incidentes/ValidarIncidentes.tsx`
- `frontend/src/components/incidentes/ReportarIncidenciaModal.tsx`
- `frontend/src/components/mapa/MapaInteractivo.tsx`
- `frontend/src/types/index.ts`

## Qué se hizo
1. **Persistencia real de reportes de incidentes**:
   - `reportarIncidenteApi`, `confirmarIncidenteApi` y `resolverIncidenteApi` ahora adjuntan el token JWT del ciclista autenticado (`token || localStorage.getItem('bicisafe.token')`).
   - Se removió la máscara en memoria (`local-${Date.now()}`) ante fallos; las respuestas HTTP que no sean 2xx lanzan una excepción con el mensaje del servidor para notificar al usuario.
2. **Eliminación de valores hardcodeados de reputación**:
   - En el backend (`IncidenteServiceImpl.java`), la reputación del autor del reporte se consulta directamente desde la base de datos (`servicioRegistro.obtenerPorId(usuarioId).reputacion()`), usando 15 únicamente como fallback de partida.
   - En el frontend (`App.tsx`, `Perfil.tsx`, `ValidarIncidentes.tsx`), se unificó la base de reputación en 15 y la escala de visualización en 100 puntos acorde a las reglas del modelo de dominio.
3. **Rediseño del modal de reporte según directrices UX/UI**:
   - `ReportarIncidenciaModal.tsx` fue reestructurado con textos breves de 1 a 3 palabras ("Tipo", "Ubicación", "Fijar mapa", "Detalle (opcional)", "Foto (opcional)", "Enviar reporte").
   - Se eliminaron explicaciones largas y pasos numerados innecesarios.
4. **Eliminación de porcentaje de seguridad ficticio en ciclovías**:
   - Se eliminó el `safetyScore: 98%` hardcodeado que se mostraba en el popup de las ciclovías en `MapaInteractivo.tsx`.
   - Se reemplazó por un cálculo dinámico en tiempo real basado en los incidentes activos cercanos a la vía: muestra `Sin alertas` en verde o `{n} alerta(s)` en rojo.

## Por qué
- La creación de incidentes fallaba silenciosamente por falta de cabecera `Authorization: Bearer`, provocando que los reportes solo existieran temporalmente en memoria del navegador.
- Los puntajes de reputación y seguridad estaban hardcodeados, falseando la información comunitaria.
- El modal de reportes no cumplía las directrices de concisión y diseño minimalista establecidas en `022-reglas-ux-ui-y-comunicacion.md`.

## Cómo se verificó
- **Backend tests**: `./mvnw test -q` ejecutó 55 pruebas unitarias y de integración: 0 fallos, 0 errores.
- **Frontend tests**: `npm test -- --run` ejecutó 8 archivos y 13 pruebas: 100% en verde.
- **Frontend build**: `npm run build` compiló sin advertencias ni errores TypeScript.
- **Verificación E2E de persistencia**:
  - Creación de incidente con token JWT mediante `POST /api/incidentes`.
  - Verificación en PostgreSQL: registro persistido en la tabla `incidente` con `autor_reputacion: 15`.
  - Incremento de reputación del usuario en la tabla `usuario` de 15 a 17 puntos (+2 por reporte verídico).
  - Consulta en `GET /api/incidentes/activos` y `GET /api/usuarios/perfil` confirmando el nuevo incidente e historial.
