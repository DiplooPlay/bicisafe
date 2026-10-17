# Historia: Registro de ciclista con verificación por correo (E1)

Estado de la historia al 2026-10-17:

## Lo implementado

- Formulario de registro con validación de contraseñas seguras (BCrypt factor 10, mínimo 8 caracteres) y correo único (409 Conflict si ya existe).
- Creación de cuenta en estado `PENDIENTE_VERIFICACION` con token seguro y único de confirmación de 24 horas.
- ~~**Envío real del correo de confirmación**~~: resuelto el 2026-10-17 (ver `docs/cambios/014-credenciales-correo-verificacion.md`). Con credenciales Gmail SMTP en `.env`, el adapter entrega correos HTML reales con enlace de activación de un solo uso.
- Verificación por enlace `{frontend}/?token=...`, activación de cuenta a `ACTIVO` y pantalla dedicada `VerificarCorreo.tsx`.
- Fallback tolerante en desarrollo: cuando las credenciales SMTP no están presentes, el sistema registra el enlace y token en el log de consola para permitir pruebas completas sin bloquear al desarrollador.

## Lo pendiente y por qué

- **Restablecimiento de contraseña olvidada (Forgot Password)**: Aunque el registro y activación por correo están completados al 100%, la recuperación de contraseña tras olvido fue separada para implementarse con un flujo propio de seguridad (token de recuperación con expiración breve de 15 minutos y endpoint de reseteo).

## Lo que se intentó

- **Análisis del alcance de la HU E1**:
  - Se revisó si el flujo de recuperación de contraseña debía ser parte del registro o de un módulo autónomo de gestión de perfil.
  - **Resultado**: La historia original de usuario está enfocada estrictamente en el "Registro de ciclista con verificación por correo" para garantizar que solo usuarios con correo comprobado puedan reportar incidentes. Extender la tabla `token_verificacion` para usos múltiples generaría acoplamiento innecesario.
- **Manejo de tokens de verificación sin SMTP activo**:
  - Se probó el registro sin credenciales SMTP configuradas.
  - **Resultado**: Se implementó una captura elegante que imprime el token en consola evitando excepciones 500 y permitiendo verificar cuentas en entornos offline.

## Siguientes pasos

- Crear una historia de usuario independiente (`E1-recuperacion-password`) con su respectiva tabla/entidad `TokenRecuperacion` y endpoints `POST /api/auth/recuperar-password` y `POST /api/auth/restablecer-password`.
