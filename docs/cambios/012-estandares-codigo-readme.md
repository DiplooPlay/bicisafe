# 012 — Estándares de código en el README

## Fecha
2026-10-17

## Archivos
- `README.md` (modificado — nueva sección "Estándares de código")

## Qué se hizo
Se agregó al README una sección **"Estándares de código"** con las convenciones del proyecto:
- **Principios**: legibilidad primero, KISS, DRY sin abstracción prematura, YAGNI, SOLID.
- **Idioma**: identificadores/comentarios/Javadoc/TSDoc y commits en **inglés**; documentación y
  textos de usuario en **español**.
- **Nombres**: descriptivos, sin abreviaturas crípticas; convenciones Java y TypeScript.
- **Comentarios**: explican *el por qué, no el qué*; Javadoc/TSDoc en APIs públicas; ejemplos de
  comentario bueno vs. malo; `TODO`/`FIXME` con contexto.
- **Backend**: inyección por constructor, controller delgado, no exponer entidades, DTOs con
  MapStruct, Bean Validation, `@Transactional` en servicios, excepciones de negocio.
- **Frontend**: componentes funcionales + hooks, TypeScript estricto (sin `any`), separación
  presentación/servicios/estado, ESLint + Prettier, Vitest.
- **Pruebas**: unitarias e integración, nombres descriptivos, **ArchUnit** para proteger la
  arquitectura.
- **Formato y git**: formateo automático, Conventional Commits y prefijos de rama.

## Por qué
- El objetivo es tener un **camino claro de calidad a futuro**: que cualquier integrante escriba
  código con los mismos estándares y que el proyecto se mantenga legible y mantenible al crecer.
- Documentar las reglas en el README las vuelve visibles y verificables (varias son automatizables:
  ArchUnit, ESLint, Prettier, formatter de Java).
- Se definió una **política de idioma** explícita para evitar mezclas inconsistentes: el código y sus
  comentarios en inglés (estándar y compatible con librerías/herramientas), la documentación y los
  textos de cara al usuario en español.

## Notas / pendientes
- Conviene materializar la automatización: configurar **ArchUnit** (backend) y **ESLint/Prettier**
  (frontend) para que estas reglas se verifiquen en CI.
- Estas convenciones complementan el patrón **monolito modular** descrito en el mismo README
  (cambio [011](011-readme-arquitectura.md)).
