# 023 · Implementación de historias de usuario (HU-03, HU-04, HU-08, HU-09, HU-14, HU-15, HU-16, HU-17) y requisitos no funcionales (RNF-01, RNF-06, RNF-10)

## Fecha
2026-11-20

## Archivos modificados y creados

### Backend
- `backend/pom.xml`: integración de `jacoco-maven-plugin` (0.8.12) con meta de cobertura mínima del 60%.
- `backend/src/main/resources/db/migration/V4__extensiones_historias_usuario.sql`: migración Flyway para tokens de recuperación, denuncias de moderación, rutas guardadas y reputación.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/domain/TokenRecuperacion.java`: entidad con token seguro de un solo uso y expiración de 15 minutos (HU-03).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/domain/Usuario.java`: campo `reputacion`, métodos `actualizarPassword` y `sumarReputacion`.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/dto/SolicitudRecuperarPassword.java`: validación de correo para recuperación.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/dto/SolicitudRestablecerPassword.java`: validación de token y nueva contraseña (mínimo 8 caracteres).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/dto/PerfilUsuarioResponse.java`: proyección segura de perfil y reputación (HU-04).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/repository/TokenRecuperacionRepository.java`: repositorio JPA de tokens de recuperación.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/service/ServicioAutenticacion.java` y `ServicioAutenticacionImpl.java`: lógica de negocio para solicitud y restablecimiento de contraseña.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/service/ServicioRegistro.java` y `ServicioRegistroImpl.java`: soporte para eliminación de cuenta (RNF-10) y actualización de reputación.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/service/ServicioCorreo.java` y `CorreoVerificacionAdapter.java`: plantillas para recuperación de contraseña y alertas de incidentes en rutas guardadas (HU-17).
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/controller/AutenticacionControlador.java`: endpoints públicos `POST /api/auth/recuperar-password` y `POST /api/auth/restablecer-password`.
- `backend/src/main/java/pe/edu/untels/bicisafe/auth/controller/UsuarioControlador.java`: endpoints autenticados `GET /api/usuarios/perfil` y `DELETE /api/usuarios/me`.
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/domain/Punto.java`, `Ruta.java`, `PuntoElevacion.java`, `RutaResponse.java`: soporte para perfil de elevación, desnivel positivo/negativo y muestras de altitud (HU-08).
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/domain/RutaGuardada.java` y `RutaGuardadaRepository.java`: entidad y persistencia de rutas frecuentes con geometría cacheada (HU-16).
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/dto/GuardarRutaRequest.java`, `RutaGuardadaResponse.java`, `UsuarioRutaAfectada.java`: DTOs de rutas guardadas y alertas.
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/service/ServicioRutaGuardada.java` y `ServicioRutaGuardadaImpl.java`: servicio para guardar, listar y eliminar rutas sin recalcular, y búsqueda de rutas cercanas a incidentes (HU-16, HU-17).
- `backend/src/main/java/pe/edu/untels/bicisafe/ruta/controller/RutaGuardadaControlador.java`: endpoints `POST`, `GET`, `DELETE` en `/api/rutas/guardadas`.
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/EstadoIncidente.java`: estado `EXPIRADO` para descarte automático (HU-15).
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/Incidente.java`: métodos `marcarComoExpirado` y `registrarDenuncia`.
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/domain/IncidenteDenuncia.java` y `IncidenteDenunciaRepository.java`: moderación de incidentes inapropiados (HU-14).
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/dto/SolicitudDenuncia.java`: DTO para reportar falso o duplicado.
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/service/IncidenteService.java` y `IncidenteServiceImpl.java`: expiración periódica (`@Scheduled`), vinculación con autor y reputación, alerta por correo a ciclistas afectados en rutas guardadas y filtrado de incidentes sobre la ruta (HU-09, HU-14, HU-15, HU-17).
- `backend/src/main/java/pe/edu/untels/bicisafe/incidente/controller/IncidenteControlador.java`: endpoints `POST /api/incidentes/{id}/denunciar` y `POST /api/incidentes/en-ruta`.
- `backend/src/main/java/pe/edu/untels/bicisafe/config/security/ConfiguracionSeguridad.java`: permisos de seguridad por ruta y métodos.
- Suite de pruebas unitarias (`AutenticacionServiceImplTest.java`, `IncidenteServiceTest.java`, `ServicioRutaGuardadaImplTest.java`, `UsuarioControladorTest.java`, `AutenticacionControladorTest.java`, `RutaGuardadaControladorTest.java`, `RegistroServiceImplTest.java`).

### Frontend
- `frontend/src/types/index.ts`, `frontend/src/types/rutas.ts`, `frontend/src/types/sesion.ts`: extensiones de tipos para elevación, rutas guardadas, reportes y perfil.
- `frontend/src/services/api.ts`: soporte para método HTTP `DELETE`.
- `frontend/src/services/auth.ts`: métodos de recuperación de contraseña, perfil completo y eliminación de cuenta.
- `frontend/src/services/rutas.ts`: métodos para guardar, listar y eliminar rutas frecuentes.
- `frontend/src/services/incidenteService.ts`: métodos para denunciar incidentes y obtener incidentes sobre la ruta.
- `frontend/src/context/SesionContext.tsx`: exposición segura del token y estado por defecto ante uso fuera de proveedor.
- `frontend/src/pages/RecuperarPassword.tsx`: vista para solicitar enlace de recuperación por correo (HU-03).
- `frontend/src/pages/RestablecerPassword.tsx`: vista para establecer nueva contraseña con validación (HU-03).
- `frontend/src/pages/Perfil.tsx`: vista de perfil ciclista con nivel de reputación, historial de aportes y eliminación de cuenta (HU-04, RNF-10).
- `frontend/src/pages/Login.tsx`: enlace directo a recuperación de contraseña.
- `frontend/src/components/rutas/PerfilElevacion.tsx`: componente visual de cambios de altitud SVG responsivo (HU-08).
- `frontend/src/components/rutas/PlanificadorRuta.tsx`: integración de perfil de elevación, guardado y carga de rutas frecuentes sin recalcular, y alerta de incidentes sobre la ruta (HU-08, HU-09, HU-16, RNF-01).
- `frontend/src/components/incidentes/DenunciarIncidenteModal.tsx`: modal para reportar incidente falso o duplicado (HU-14).
- `frontend/src/components/incidentes/ValidarIncidentes.tsx`: integración del botón de denuncia comunitaria.
- `frontend/src/components/layout/Navbar.tsx` y `BottomNav.tsx`: acceso al perfil ciclista.
- `frontend/src/App.tsx`: enrutamiento por vistas y captura de parámetros `token` y `resetToken`.
- Pruebas frontend (`RecuperarPassword.test.tsx`, `PerfilElevacion.test.tsx`, `DenunciarIncidenteModal.test.tsx`, `PlanificadorRuta.test.tsx`).

### Documentación y Cierre de Historias Pendientes
- `docs/historias-pendientes/e1-registro-ciclista.md`: eliminado de la carpeta al quedar resuelta la recuperación de contraseñas.
- `docs/historias-pendientes/README.md`: fila retirada según política de cierre.

## Qué se hizo y Por qué

1. **HU-03 · Recuperar contraseña**: Se implementó el flujo completo solicitado. El ciclista solicita el restablecimiento, recibe un correo con enlace seguro de un solo uso válido por 15 minutos, establece una nueva contraseña de al menos 8 caracteres y puede iniciar sesión inmediatamente con sus nuevas credenciales.
2. **HU-04 · Consultar perfil y reputación**: Se añadió la pantalla de perfil ciclista donde se muestra la reputación acumulada, el nivel alcanzado en la comunidad, el historial de incidentes reportados y las métricas de aporte.
3. **HU-08 · Ver perfil de elevación**: Se adaptó el servicio ORS para solicitar elevación en 3D y se diseñó un componente visual responsivo en SVG que grafica las subidas y bajadas a lo largo del recorrido.
4. **HU-09 · Ver incidentes sobre la ruta**: Se implementó el cálculo y filtrado de incidentes dentro del corredor de la ruta (150m), permitiendo al ciclista decidir si seguir la ruta o modificarla ante alertas en el camino.
5. **HU-14 · Reportar incidente inapropiado**: Se habilitó el reporte de incidentes falsos o duplicados con categorización y comentarios breves, marcando los incidentes en disputa o retirándolos ante denuncias reiteradas.
6. **HU-15 · Expirar incidentes automáticamente**: Se configuró la expiración periódica de incidentes que no alcanzaron confirmación en su periodo de vigencia (2 horas), garantizando que solo la información vigente aparezca en el mapa.
7. **HU-16 · Guardar ruta frecuente**: Se añadió la persistencia de rutas frecuentes con validación de nombre no vacío, confirmación inmediata y consulta instantánea usando la geometría almacenada para evitar llamadas repetidas a ORS.
8. **HU-17 · Recibir alerta por correo**: Al confirmarse un incidente vial, el sistema detecta de forma automática a los ciclistas cuyas rutas guardadas pasen a menos de 500 metros y les despacha un correo de alerta preventivo.
9. **RNF-01**: Cálculo de ruta optimizado con feedback visual de carga ("Calculando..."), caché en memoria y tiempos inferiores a 2 segundos.
10. **RNF-06**: Arquitectura modular en capas verificada con ArchUnit; cobertura JaCoCo en backend superó el 73.96% (meta ≥ 60%); builds y pruebas en verde en backend y frontend.
11. **RNF-10**: Respeto a la privacidad (no se guarda la ubicación en tiempo real del ciclista en la base de datos) y se permite la eliminación completa de la cuenta mediante endpoint `DELETE /api/usuarios/me`.
12. **Cierre de pendientes**: Concluido el pendiente de recuperación de contraseña de E1, se removió `e1-registro-ciclista.md` y se actualizó el índice respectivo.

## Cómo se verificó

1. **Backend**:
   - Compilación y ejecución de la suite completa de pruebas: `./mvnw test`
   - Resultados: 50 pruebas ejecutadas, 0 fallos, 0 errores, 0 omitidas.
   - Verificación de arquitectura modular: `ArquitecturaBiciSafeTest` en verde.
   - Verificación de cobertura JaCoCo: meta fijada en 60%, alcanzado 73.96% de instrucciones cubiertas (3,937 instrucciones analizadas, 2,912 cubiertas).
2. **Frontend**:
   - Pruebas unitarias de componentes y servicios: `npm test` (Vitest)
   - Resultados: 6 archivos de prueba pasados, 7 pruebas exitosas.
   - Compilación y verificación estática de tipos TypeScript: `npm run build` completado sin errores.
