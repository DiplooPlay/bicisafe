# Cambio 021: Filtro de Ruta planificada, trazo de alto contraste naranja deportivo y pines de origen/meta

## Fecha

2026-10-17

## Archivos modificados

- `frontend/src/components/mapa/MapaInteractivo.tsx` (adición del filtro interactivo `Ruta`, trazo de doble capa naranja/blanco de alto contraste, marcadores de origen y meta, y ajuste automático de encuadre `fitBounds`).
- `docs/cambios/README.md` (actualización del índice general de cambios del proyecto).

---

## Qué se hizo

1. **Nuevo chip de filtro `[• Ruta (X km)]` en la barra superior**:
   - Aparece dinámicamente cuando el ciclista genera una ruta desde el planificador.
   - Cuenta con indicador pulsante en naranja y muestra la distancia calculada en kilómetros.
   - Al seleccionarlo, aísla la ruta planificada ocultando las demás ciclovías circundantes para eliminar cualquier confusión visual con las líneas azules y verdes de la capa base CyclOSM.

2. **Nuevo estilo de trazo de alto contraste (Naranja Deportivo + Halo Blanco)**:
   - **Problema previo**: La ruta se dibujaba en azul (`#0284c7`), lo que provocaba que se confundiera con la infraestructura ciclista y las etiquetas azules de CyclOSM / OpenStreetMap.
   - **Solución implementada**:
     - **Halo inferior blanco**: Trazo de 9px de grosor (`#ffffff`, opacidad 0.95) que crea un borde nítido sobre cualquier color de mapa.
     - **Línea activa naranja de alta visibilidad**: Trazo de 5.5px de grosor (`#ea580c`), con extremos redondeados (`lineCap: 'round', lineJoin: 'round'`).
     - **Popup informativo de la ruta**: Al hacer clic en el trazado se despliega una tarjeta con icono de desvío ciclista, distancia en km, tiempo estimado y perfil de seguridad.

3. **Marcadores visuales de inicio y llegada**:
   - Se crearon iconos Leaflet personalizados (`createRouteEndpointIcon`):
     - **Pin de Origen**: Badge blanco con círculo esmeralda e icono `trip_origin`.
     - **Pin de Meta**: Badge blanco con círculo naranja e icono `flag`.

4. **Controlador de encuadre automático (`RouteFitController`)**:
   - Al trazar la ruta o seleccionar el filtro, el mapa ajusta automáticamente el zoom y centra la pantalla (`map.fitBounds`) para cubrir cómodamente todo el recorrido planificado con un margen de 70px.

---

## Cómo se verificó

- `npm test -- --run` en `frontend/` → 4 pruebas unitarias aprobadas.
- `npm run build` en `frontend/` → compilación exitosa sin errores de TypeScript ni advertencias.
