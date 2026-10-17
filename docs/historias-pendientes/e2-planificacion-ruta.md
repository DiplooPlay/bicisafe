# Historia: Planificación de ruta ciclista (E2)

Estado de la historia al 2026-10-17:

## Lo implementado

- ~~**Cálculo real verificado de extremo a extremo**~~: resuelto el 2026-10-17 (ver `docs/cambios/014-credenciales-correo-verificacion.md`). Con `ORS_API_KEY` en `.env` (cargado al arrancar el backend) la ruta Miraflores → UNTELS respondió 200 con 14.9 km, 51 min y 370 puntos de recorrido vía OpenRouteService `cycling-regular`.
- `PlanificadorRuta` con búsqueda de origen/destino o GPS, botón `Calcular viaje`, y telemetría de ruta (`distanciaKm` / `duracionMin`) con `GET /api/rutas`.
- Adapter `OrsAdapter` con llamada a OpenRouteService geojson y fallback en caso de indisponibilidad.
- `MapaInteractivo` dibuja la polilínea con coordenadas reales y marcadores de origen y destino.
- Resiliencia de visitante (HU6): si el servicio de rutas falla (502 / timeout), el mapa y las alertas de incidentes permanecen 100% operativos.

## Lo pendiente y por qué

- **Métricas de calidad de superficie por tramo (asfalto, adoquín, ciclovía segregada)**: El endpoint básico `cycling-regular` provee la geometría y tiempo para ciclistas, pero el desglose porcentual de superficie por tramo requiere enriquecimiento de atributos OSM o integración con el buffer espacial de incidentes comunitarios de PostGIS.

## Lo que se intentó

- **Inspección de atributos extra de la API de OpenRouteService (`extra_info`)**:
  - Se analizó la petición a ORS incluyendo `extra_info: ["surface", "waytype", "steepness"]`.
  - **Resultado**: En la red vial y de ciclovías de Lima Metropolitana, la mayoría de los ways en OpenStreetMap carecen de la etiqueta `surface=*` o `smoothness=*`, devolviendo valores nulos o genéricos (`unknown`), lo que hace que un cálculo porcentual sea poco confiable sin curaduría comunitaria previa.
- **Cruce espacial con incidentes de PostGIS**:
  - Con la tabla de `incidente` (geom PostGIS 4326) se comprobó la viabilidad de calcular incidentes a menos de 50 metros de los puntos de la ruta.
  - **Resultado**: El backend permite consultar incidentes en radio (`ST_DWithin`), pero la ponderación de un índice de seguridad global requiere un algoritmo de ponderación que combine votos comunitarios y severidad.

## Siguientes pasos

- Diseñar en el siguiente ciclo un algoritmo de puntuación de seguridad ("Score de Seguridad BiciSafe") que consulte los incidentes activos a lo largo de la polilínea devuelta por ORS.
