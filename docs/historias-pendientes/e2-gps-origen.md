# Historia: GPS como lugar de origen (E2)

Estado de la historia al 2026-10-17:

## Lo implementado

- ~~**Precisión de geolocalización satelital y tiempos de respuesta**~~: resuelto el 2026-10-17 (ver `docs/cambios/015-implementacion-historias-incidentes-seguridad-precision.md`). Se implementó el hook `useGeolocalizacion.ts` configurado con `enableHighAccuracy: true`, `timeout: 12000`, `maximumAge: 0`, y lectura de `coords.accuracy` en metros.
- ~~**Interfaz gráfica con indicador de precisión y recentrado**~~: resuelto el 2026-10-17. El mapa muestra el radio de exactitud en metros, badge de estado GPS (`±15 m (Alta precisión satelital/GPS)`) y botón flotante de recentrado.
- ~~**Pruebas unitarias automatizadas del hook de GPS**~~: resuelto el 2026-10-17 (ver `docs/cambios/017-resolucion-hu-busqueda-e-inicio-sesion.md`). Se crearon pruebas en Vitest (`src/hooks/useGeolocalizacion.test.ts`) que validan la adquisición de coordenadas con alta precisión y la captura de errores `PERMISSION_DENIED` y `TIMEOUT`.
- `PlanificadorRuta` obtiene el origen con GPS mediante el botón "Usar mi GPS" y calcula la ruta ciclista.

## Lo pendiente y por qué

- **Verificación física en hardware móvil real**: En un servidor de desarrollo headless / contenedor Linux no existe chip receptor GPS ni pantalla táctil de smartphone físico. La interacción nativa del navegador móvil solicitando permisos al sistema operativo Android/iOS requiere validación humana sobre el dispositivo real en calle.

## Lo que se intentó

- **Simulación y pruebas en entorno de pruebas (jsdom + Vitest)**:
  - Se implementó un test mockeando la API nativa `navigator.geolocation.getCurrentPosition` simulando tanto el retorno de coordenadas con error de margen de 15 m como el rechazo por parte del usuario (`code: 1, PERMISSION_DENIED`).
  - **Resultado**: La lógica de negocio y la interfaz de usuario responden al 100% de los criterios: ante éxito se actualiza la posición y se calcula el radio, y ante fallo se emite notificación de aviso sin romper la aplicación y se aplica la coordenada de fallback en Lima.
- **Verificación con navegador desktop**:
  - Se probó la invocación a la API estándar de geolocalización de HTML5.
  - **Resultado**: Depende de la triangulación por IP pública del proveedor de internet (ISP) en escritorio, lo cual ofrece precisión variable (~1-5 km) a diferencia de un receptor GPS móvil asistido por hardware.

## Siguientes pasos

- En el ciclo de pruebas de aceptación (QA Release en terreno), abrir la aplicación desde el navegador de un smartphone en Lima Metropolitana para validar el diálogo emergente nativo del sistema operativo ("¿Permitir que BiciSafe use tu ubicación precisa?").
