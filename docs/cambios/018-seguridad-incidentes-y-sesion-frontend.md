# Cambio 018: Seguridad de escritura de incidentes, unicidad de JWT y fusión de sesión en el frontend

## Fecha

2026-10-17

## Archivos afectados

- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/ConfiguracionSeguridad.java`
- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/JwtServicio.java`
- `frontend/src/services/incidenteService.ts`
- `frontend/src/App.tsx`
- `frontend/src/hooks/useGeolocalizacion.test.ts` (import `act` sin uso)
- `docs/historias-pendientes/` (estado reconciliado con el cierre del 017)

## Qué estaba pendiente (dentro del cierre del 017 de HU E1 Inicio de sesión)

La verificación de extremo a extremo del cierre declarado en
`017-cierre-hu-inicio-sesion-y-busqueda-lugares.md` reveló tres huecos que
impedían cumplir "solo el ciclista autenticado reporta y valida":

1. `RUTAS_PUBLICAS` incluía `/api/incidentes/**` completo: **cualquier
   visitante podía crear incidentes** (`POST /api/incidentes` devolvía 201 con
   autor por defecto "Ciclista Urbano").
2. `JwtServicio` no incluía `jti` y la lista negra guarda el token crudo;
   dos logins el mismo segundo generan el mismo token (iat/exp con resolución
   de segundos), así que el logout **revocaba también el token siguiente**.
3. El frontend no enviaba `Authorization` en `confirmarIncidenteApi` /
   `resolverIncidenteApi` (fallaban en silencio al volver a la simulación
   local) y `App.tsx` había perdido el Integration E1: sin `ProveedorSesion`,
   sin gating de reporte/validación, con un flujo "Invitado" y sin las
   pantallas de registro/verificación.

## Cómo se resolvió

- **Seguridad por método HTTP**: `/api/incidentes/activos`, `/api/incidentes`
  y `/api/incidentes/*` son públicos **solo para `GET`** (`HttpMethod.GET`,
  `LECTURA_PUBLICA_INCIDENTES`); todo lo demás queda detrás del JWT.
- **Unicidad de tokens**: `JwtServicio.generarToken` agrega
  `.id(UUID.randomUUID().toString())` (jti); la lista negra por token crudo
  ya no colisiona entre sesiones consecutivas.
- **Frontend autenticado**: `incidenteService` envía `Bearer` tomado de
  `localStorage('bicisafe.token')` en crear/confirmar/resolver.
- **App.tsx fusionado** con la sesión E1 preservando el trabajo de incidentes:
  `ProveedorSesion`, gating de reportar/validar (visitante → login), tabs
  `registro`/`verificar`, lectura de `?token=` del enlace de correo, logout
  que llama al backend (lista negra) y descartado el acceso "Invitado".

## Cómo se verificó

- `mvn test`: **27/27** en verde; `mvn -q compile` sin errores.
- `npm run build`: sin errores de TypeScript; `npm test` (Vitest):
  **4/4**.
- `curl` contra el backend corriendo:
  - `GET /api/incidentes/activos` (visitante) → **200**.
  - `POST /api/incidentes` sin JWT → **401**; con JWT de cuenta verificada → **201**.
  - `POST /api/incidentes/{id}/confirmar` sin JWT → **401**.
  - `POST /api/auth/logout` → **200**; `GET /api/usuarios/me` con ese token → **401**;
    login inmediato después del logout → **200** (ya no colisiona con la lista negra).

## Notas / pendientes

- La lista negra es en memoria y no expira entradas: suficiente para la HU
  (los tokens viven 24 h); si en producción se escala a varias instancias,
  mover la lista negra a la base de datos.
- La política de cierre (regla 3 del README de pendientes) y su verificación
  galardonan que los archivos restantes (`e2-gps-origen`,
  `e2-planificacion-ruta`, `e1-registro-ciclista`) describan "Lo que se
  intentó" con siguientes pasos concretos.
