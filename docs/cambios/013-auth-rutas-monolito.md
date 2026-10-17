# Cambio 013: Implementación auth (E1) y rutas (E2) en el monolito

## Resumen

Implementación de las historias de usuario de los épicos E1 (gestión de cuenta) y E2 (planificación de ruta como visitante) siguiendo los principios de arquitectura del README: monolito modular backend (módulos `auth`, `ruta`, `config/`, `compartido/`, `integracion/`) con puertos y adaptadores, API REST con JWT, y frontend React/TypeScript integrado al API real.

## Backend

### Módulo `auth`
- Domain: `Usuario` (con `RolUsuario` y `EstadoUsuario`, contraseñas hasheadas con BCrypt), `TokenVerificacion` (token UUID de 24 h).
- Flyway `V2__usuario_y_token_verificacion.sql`: tablas `usuario` y `token_verificacion` (PKs UUID, correo único).
- Puertos: `ServicioCorreo` (interfaz), adapter `integracion/correo/CorreoVerificacionAdapter` (envío `@Async` con Gmail SMTP).
- Servicios: `ServicioRegistroImpl` (valida correo único, crea usuario `PENDIENTE_VERIFICACION`, emite token), `ServicioAutenticacionImpl` (login con BCrypt, emitir JWT).
- Seguridad JWT (`config/security/`): `JwtServicio` (jjwt 0.13.0, HS256, expiración 60 min, claims `email`/`role`), filtro `JwtAutenticacionFiltro`, `ConfiguracionSeguridad` con `RUTAS_PUBLICAS` (`/api/auth/**`, `/api/lugares/**`, `/api/rutas/**`, `/actuator/health`).
- API:
  - `POST /api/auth/registro` → 201; duplicado → 409; validación Bean Validation → 400 con `errores` por campo.
  - `GET /api/auth/verificar?token=` → activa la cuenta; token inválido/reusado → 400.
  - `POST /api/auth/login` → 200 `{token, tipoToken, expiracionMinutos, usuario}`; credenciales inválidas → 401 genérico (no enumera si el correo existe); cuenta sin verificar → 403.
  - `GET /api/usuarios/me` → 200 (JWT requerido) / 401.
- Manejo de errores uniforme con `ManejadorGlobalExcepciones` (cuerpo `{mensaje, errores}`).

### Módulo `ruta`
- Domain: `Punto`, `Ruta` (distancia/duración/recorrido), `Lugar`, `PerfilMovilidad`.
- Puertos: `ProveedorGeolocalizacion` y `ProveedorRutas`, implementados por adapters en `integracion/osm/NominatimAdapter` y `integracion/ors/OrsAdapter` (RestClient; Boot 4.1 → starters `spring-boot-starter-jackson` + `spring-boot-starter-restclient`).
- API pública (visitantes):
  - `GET /api/lugares?texto=` búsqueda con Nominatim, limitada al bbox de Lima.
  - `GET /api/rutas?latOrigen&lngOrigen&latDestino&lngDestino` → ruta `cycling-regular` desde OpenRouteService; responde con distancia, duración y puntos del recorrido. Las dos rutas usan cache Caffeine de 10 minutos.
- Validaciones: texto mínimo de 3 caracteres en búsqueda, origen y destino distintos (≥ 50 m entre sí) para planificar.

### Transversales y pruebas
- `config/` contiene los caprichos transversales: security, web (CORS + errores), cache, async y propiedades de URL de frontend.
- Coherencia de arquitectura validada con ArchUnit (`ArquitecturaBiciSafeTest`): los controladores no acceden repositorios y los adapters no dependen de la capa web ni de repositorios.
- Tests unitarios de servicios y adapters en verde (22/22 con `mvn test`).

## Frontend
- `services/`: `api.ts` (fetch con carpetas `ApiError`), `auth.ts`, `lugares.ts`, `rutas.ts`.
- `context/SesionContext.tsx`: sesión restaurada de `localStorage` vía `GET /api/usuarios/me`; logout limpia las claves.
- Páginas: `Registro` (errores por campo), `VerificarCorreo` (lee `?token=` del enlace de correo), `Login` (integrado al servicio de cuentas).
- `PlanificadorRuta`: búsqueda con sugerencias, uso de GPS como origen y cálculo real de ruta contra el backend.
- `App.tsx` con `ProveedorSesion`, navegación por tabs y gating de reporte/validación para usuarios autenticados (funciones mock pendientes del módulo incidente).
- Se eliminó `services/openRouteService.ts` (llamada directa a ORS desde el frontend con una clave incrustada; el cálculo ahora pasa por el backend).

## Verificación
- `mvn test`: todas las pruebas pasan.
- `npm run build` en frontend: build sin errores de TypeScript.
- Flujo E1 verificado con curl contra Postgres local (registro → token en BD → verificar → login → `/api/usuarios/me`).
- `GET /api/lugares` probado contra Nominatim real.

## Notas
- La clave de ORS usada anteriormente en `openRouteService.ts` fue eliminada del repositorio; rotarla en el proveedor por prudencia.
