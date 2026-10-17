# 011 — README raíz con la arquitectura

## Fecha
2026-10-17

## Archivos
- `README.md` (creado en la raíz)

## Qué se hizo
Se creó el `README.md` del repositorio. Incluye:
- Descripción del proyecto y **stack tecnológico**.
- El **patrón arquitectónico: monolito modular**, con sus principios (módulos por dominio,
  comunicación por interfaces de servicio, dependencias hacia adentro, transversales en `config/`,
  compartidos en `compartido/`, adaptadores en `integracion/`) y un diagrama Mermaid.
- La **estructura del repositorio** actualizada.
- La tabla de **módulos del backend** (E1–E5 + transversales) y la estructura del frontend.
- Cómo ejecutar backend y frontend, y las variables de entorno principales.
- Referencia al registro de cambios (`docs/cambios/`).

## Por qué
- No existía un README en la raíz; era el punto de entrada natural del proyecto y su ausencia
  dificultaba entender la organización.
- Fijar la **arquitectura esperada** en el README sirve como contrato del proyecto: guía dónde va
  cada cosa y mantiene el control sobre la estructura a medida que crece (evita que los módulos se
  mezclen o que se acumulen capas globales).
- Se documentó como monolito modular (no capas globales) porque ese es el patrón acordado con
  módulos por épica.

## Notas / pendientes
- Los diagramas C4 detallados y los ADR quedan pendientes en `docs/arquitectura/`.
- La especificación OpenAPI se servirá desde springdoc en `/v3/api-docs` y `/swagger-ui.html`.
