# 008 - Descompresión de prototipos Stitch y plan de implementación frontend

**Fecha:** 2026-10-17  
**Archivos afectados:**
- `stitch_cicloruta_mvp_web/` (directorio nuevo con assets y pantallas HTML/CSS de Stitch)
- `docs/cambios/008-descompresion-stitch-y-plan-frontend.md`
- `docs/cambios/README.md`

## Qué se hizo

1. Se localizó el archivo `stitch_cicloruta_mvp_web.zip` en la carpeta de descargas del usuario (`/home/diploo/Descargas/`).
2. Se descomprimió exitosamente usando la utilidad `7z` en el directorio raíz del proyecto:
   ```bash
   7z x /home/diploo/Descargas/stitch_cicloruta_mvp_web.zip -o.
   ```
3. Se analizó la estructura del diseño generado por Google Stitch:
   - **Sistema de diseño Velo Kinetic** (`velo_kinetic/DESIGN.md`): paleta deportiva/escandinava con verde esmeralda primario (`#006948`), azul secundario (`#006398`), fondos claros (`#f8f9ff`), tipografía Outfit + Inter, bordes sutiles y botones tipo píldora (`rounded-full`).
   - **Módulos y pantallas disponibles:**
     - `explorar_mapa_1` / `explorar_mapa_2`: Exploración de mapa con capas de ciclovías, pines de incidencias/puntos de interés, buscador flotante, chips de filtro y bottom sheet de tramo.
     - `rutas` / `rutas_populares`: Catálogo de rutas, filtros de dificultad/distancia, miniaturas con perfil de altimetría SVG y detalle de tramo.
     - `reportar_incidencia_1` / `reportar_incidencia_2`: Asistente de reporte en 5 pasos (tipo de obstáculo, ubicación GPS/mapa, descripción breve, fotografía y confirmación).
     - `validaci_n_de_reportes_1` / `validaci_n_de_reportes_2`: Gobernanza comunitaria descentralizada, barra de reputación ciclista y votación en tiempo real.
     - `comunidad_1` / `comunidad_2`: Feed social de ciclistas, avisos de tráfico/estado de vías y quedadas grupales.
     - `iniciar_sesi_n_1` / `iniciar_sesi_n_2`: Flujo de inicio de sesión y autenticación.
4. Se formuló la hoja de ruta técnica para implementar la interfaz en **React + Leaflet + Tailwind CSS**.

## Por qué se tomó esta decisión

El prototipo de Stitch contiene el diseño de interfaz completo y tokens de Tailwind listos para migrar a componentes React reutilizables. La combinación de **React + Leaflet** permite renderizar capas vectoriales GeoJSON para ciclovías (segregadas y vías compartidas 30) y marcadores dinámicos enriquecidos con Tailwind (`L.divIcon`), integrándose de forma natural con los endpoints espaciales de Spring Boot y PostGIS ya configurados en el backend.

## Notas / pendientes

- Inicializar el proyecto React en `frontend/` (Vite + TypeScript + Tailwind CSS).
- Configurar Leaflet y sus estilos.
- Adaptar los iconos a `lucide-react` o cargar `Material Symbols Outlined` (usado nativamente en el prototipo de Stitch).
