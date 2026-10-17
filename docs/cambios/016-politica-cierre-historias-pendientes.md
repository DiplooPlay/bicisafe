# Cambio 016: Política de cierre de historias pendientes

## Fecha

2026-10-17

## Archivos

- `docs/historias-pendientes/README.md` (nueva sección "Flujo de trabajo").
- `docs/cambios/README.md` (nueva subsección "Cierre de historias pendientes"
  en Convención).
- `docs/cambios/016-politica-cierre-historias-pendientes.md` (este documento).

## Qué se hizo

Se definió (y documentó en ambos README) el ciclo de vida de un pendiente:

- Item parcialmente resuelto → se tacha con fecha y link al documento de
  `docs/cambios/NNN-*.md` que explica cómo se arregló; el archivo de la
  historia permanece.
- Historia completamente resuelta → se **elimina** su archivo de
  `docs/historias-pendientes/` (y su fila del índice) y el cierre se
  documentan en esta carpeta como un documento nuevo que registre: qué estaba
  pendiente, por qué, cómo se resolvió y cómo se verificó, con fecha.

## Por qué

Hasta esta sesión, cuando un pendiente se resolvía se actualizaba el texto de
la carpeta de pendientes "in situ", dejando información resuelta acumulada en
`docs/historias-pendientes/`. Esa carpeta debe ser un registro vivo de trabajo
futuro, no un historial: su evidencia histórica pertenece a `docs/cambios/`.

## Notas / pendientes

- A la fecha **ninguna historia es 100% resoluble para retirar**: todas dejan
  algún item abierto (E3/incidente, Vitest, verificación en móvil, etc.).
- Cuidado con numerar: en esta carpeta existen hoy un 014 duplicado
  (`014-credenciales-correo-verificacion` y
  `014-interfaces-historias-usuario-frontend`) y un 015 distinto; los nuevos
  documentos deben usar el siguiente número sin duplicar.
