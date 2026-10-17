# 010 — Ignorar prototipos de Stitch en Git

## Fecha
2026-10-17

## Archivos
- `.gitignore` (modificado)

## Qué se hizo
Se agregó la carpeta de prototipos de diseño a `.gitignore`:

```gitignore
### Prototipos de diseño (Google Stitch) ###
stitch_cicloruta_mvp_web/

### Node / Frontend ###
node_modules/
frontend/dist/
```

## Por qué
- `stitch_cicloruta_mvp_web/` contiene los **prototipos exportados de Google Stitch** (assets,
  capturas PNG e HTML/CSS de referencia). Es material de **diseño temporal**, no código fuente del
  producto, y no debe versionarse en el repositorio (pesa, no se mantiene y no es necesario para
  compilar ni desplegar).
- Se ignora la carpeta completa (no archivos sueltos) para que cualquier contenido nuevo que se
  agregue ahí tampoco se suba por error.

## Notas / pendientes
- El diseño ya fue analizado y resumido en el cambio [008](008-descompresion-stitch-y-plan-frontend.md),
  que es lo que sí conviene conservar.
- Se agregó también `node_modules/` (dependencias de npm: se reinstalan con `npm install`, no se versionan).
- Se agregó `frontend/dist/`: es la salida de `npm run build` (Vite), un artefacto de build
  reproducible desde el código fuente que el CI (`.github/workflows`) regenera en cada despliegue.
  No se versiona para evitar inflar el repo y desincronizaciones entre el fuente y el build.
