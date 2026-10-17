# Cambio 020: Resaltado realista de ciclovías, capa base CyclOSM y delimitación geográfica de Lima y VES

## Fecha

2026-10-17

## Archivos modificados

- `frontend/src/services/mockData.ts` (reemplazo de puntos rectos aproximados por trazados geográficos precisos calle por calle generados por la red ciclista vial para Lima y Villa El Salvador).
- `frontend/src/components/mapa/MapaInteractivo.tsx` (incorporación de capa base ciclista CyclOSM con selector interactivo, delimitación `maxBounds` para Lima y Villa El Salvador, y renderizado con doble trazo/resplandor).
- `docs/cambios/README.md` (registro en el índice de cambios).

---

## Qué se hizo

1. **Eliminación de líneas rectas que cortaban cuadras y edificios**:
   - Anteriormente, las ciclovías tenían solo 3 o 4 puntos aproximados, provocando que Leaflet trazara líneas diagonales sobre manzanas residenciales, edificios y playas.
   - Se reemplazaron por trazados con la red vial ciclista real (120 a 210 coordenadas precisas por ciclovía) que siguen fielmente cada esquina, curva y calzada de las avenidas principales:
     - **Ciclovía Av. Arequipa (Eje Central)**: 192 puntos continuos.
     - **Ciclovía Av. Salaverry (Jesús María - San Isidro)**: 210 puntos continuos.
     - **Zona 30 Compartida Miraflores - Malecón**: 129 puntos que bordean el malecón sin atravesar manzanas.
     - **Ciclovía Av. Central - UNTELS (Villa El Salvador)**: 165 puntos siguiendo la avenida central de VES hasta el campus UNTELS.
     - **Ciclovía Av. Pastor Sevilla (Villa El Salvador)**: 127 puntos a lo largo de la ruta C.

2. **Capa base ciclista internacional CyclOSM**:
   - Se integró el servidor de mapas **CyclOSM** (`tile-cyclosm.openstreetmap.fr`), el estándar de OpenStreetMap para ciclismo.
   - Muestra por defecto todas las ciclovías de Lima y Villa El Salvador pintadas en el mapa base, con simbología ciclista, parqueaderos y vías protegidas.

3. **Selector de Vista de Mapa**:
   - Se añadió un botón flotante en la barra derecha del mapa con icono de bicicleta / mapa para alternar en cualquier momento entre **"Modo Ciclovías (CyclOSM)"** y **"Mapa Estándar (OSM)"**.

4. **Límites Geográficos (Restricción a Lima Metropolitana y Villa El Salvador)**:
   - Se configuraron los atributos `maxBounds` y `minZoom: 11` en `MapContainer` delimitando la vista entre `[-12.38, -77.25]` (VES y litoral sur) y `[-11.75, -76.80]` (norte/este de Lima).
   - Evita que el usuario haga paneo involuntario hacia el océano o las quebradas de la sierra (como Yauyos).

5. **Doble trazo y popups informativos**:
   - Cada ciclovía se dibuja con una línea de contraste de fondo y una línea superior brillante con información ampliada (nombre, tipo, longitud en km y porcentaje de seguridad).

---

## Cómo se verificó

- `npm test` en `frontend/` → 4 pruebas unitarias en verde.
- `npm run build` en `frontend/` → compila sin advertencias en 1.37s.
- Verificación en navegador en `http://localhost:3000`.
