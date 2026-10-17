# Historias Pendientes

Este directorio registra aquellas historias de usuario que, por razones de alcance, dependencias externas o bloqueos técnicos, hayan quedado pendientes de implementación.

---

## Estado Actual: 0 Historias Pendientes

Todas las historias de usuario requeridas han sido **implementadas y verificadas** exitosamente al 100%:

1. ✅ **Ver mapa de incidentes:** Mapa Leaflet operativo con capas OpenStreetMap, renderizado de pines por categoría con colores y símbolos, popups informativos, drawer inferior desplegable y controles de zoom y desplazamiento.
2. ✅ **Reportar incidente con ubicación, categoría y descripción:** Formulario guiado de 5 pasos con fijación de coordenadas (GPS alta precisión / clic en mapa), selector de categoría, descripción (máx. 120 chars) y emisión de alerta a la comunidad.
3. ✅ **Confirmar incidente reportado (+1 voto / consenso):** Votación comunitaria con incremento de confirmaciones, avance hacia el umbral requerido y actualización de reputación.
4. ✅ **Indicar que un incidente ya no existe (retiro del mapa):** Acción "Ya no existe / Resuelto" que actualiza el estado a `RESUELTO` y retira el marcador del mapa activo.
5. ✅ **Protección de credenciales:** Contraseñas protegidas con `BCryptPasswordEncoder(10)`, tokens JWT firmados con expiración de 24 horas (`1440 min`), variables de entorno aisladas y cabeceras seguras.
6. ✅ **Resiliencia ante caída del servicio de rutas:** Desacoplamiento total en el frontend donde cualquier fallo o timeout de rutas muestra un banner informativo sin afectar la visualización ni interacción del mapa y los incidentes.
7. ✅ **Precisión GPS:** Hook `useGeolocalizacion` con `{ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }`, indicador visual de margen de error en metros y recentrado dinámico.
