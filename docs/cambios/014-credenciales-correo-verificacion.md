# Cambio 014: Credenciales reales de correo y verificación de extremo a extremo

## Resumen

Con la contraseña de aplicación de Gmail (SMTP) aportada por el responsable del
proyecto se resolvió el único pendiente operativo del registro de ciclistas
(E1): el envío real del correo de confirmación, y de paso el cálculo real de
rutas con OpenRouteService (E2).

## Cambios

- `.env` (no versionado, en `.gitignore`): credenciales reales
  (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` y
  `ORS_API_KEY`).
- `.env.example` (plantilla versionada): restaurado a placeholders
  (`xxxx xxxx xxxx xxxx`); es una plantilla de referencia, no debe contener
  secretos.
- `CorreoVerificacionAdapter`: agrega log `Correo de verificación enviado a
  <destinatario>` cuando JavaMailSender completa el envío (antes solo
  logueaba fallos; imposible distinguir éxito silencioso).

## Verificación (2026-10-17)

- Registro `usuario.prueba.p7m4@ejemplo.com` → 201 y log de envío exitoso vía
  `smtp.gmail.com:587` (STARTTLS).
- `GET /api/rutas?latOrigen=-12.1217&lngOrigen=-77.0298&latDestino=-12.1965&lngDestino=-76.9632`
  con `ORS_API_KEY` → HTTP 200: 14.9 km, 51 min, 370 puntos (`cycling-regular`).

## Notas de seguridad

- La contraseña de aplicación de Gmail quedó expuesta temporalmente dentro de
  `.env.example` durante esta sesión; se recomienda **rotarla** en la cuenta
  de Google (Activa sesión 2FA > Contraseñas de aplicaciones) y regenerar el
  `.env`.
- La clave de ORS también estuvo expuesta históricamente; regenerarla en el
  panel de OpenRouteService sería prudente al publicar el proyecto.
- Recordatorio: `application.yml` de producción debe seguir leyendo los
  secretos del entorno, nunca con valores por defecto de desarrollo.
