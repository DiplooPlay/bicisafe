# Historias de usuario pendientes (parciales)

Este folder registra, por historia, qué partes quedan incompletas y el motivo
(estructura requerida por el README, sección "Registro de historias pendientes").
Cambios ya aplicados se documentan en `docs/cambios/`.

## Flujo de trabajo (qué hacer cuando se resuelve un pendiente)

Cada archivo `e{epico}-{tema}.md` describe únicamente lo pendiente de esa historia.

1. **Pendiente parcialmente resuelto**: anota el item tachado (`~~texto~~`)
   dentro del archivo, con fecha y una referencia al documento de
   `docs/cambios/NNN-*.md` que describe **cómo se arregló**. El archivo
   permanece en esta carpeta mientras le quede algo por resolver.
2. **Historia completamente resuelta** (no queda ningún pendiente en su
   archivo): se **elimina el archivo de esta carpeta** y se quita su fila de
   la tabla de abajo. El cierre completo (qué estaba pendiente, por qué, cómo
   se resolvió y cómo se verificó) se documenta como un cambio nuevo en
   `docs/cambios/NNN-cierre-historia-x.md` y se registra en el índice de ese
   `README.md`.
3. **Pendiente no resuelto o bloqueado (Anotar lo que se intentó)**: cuando se
   intente resolver un pendiente y no sea posible cerrarlo en el ciclo (por
   depender de dispositivos físicos, credenciales externas privadas no
   disponibles o límites de APIs de terceros), el archivo **debe permanecer**
   en esta carpeta y debe incluir una sección obligatoria **"Lo que se intentó"**:
   - **Lo que se intentó**: enfoques técnicos ejecutados, código añadido, pruebas
     automatizadas o configuraciones probadas.
   - **Resultado obtenido**: qué partes funcionaron, qué falló o qué limitación
     del entorno impidió el cierre definitivo.
   - **Por qué queda pendiente y siguientes pasos**: el motivo técnico preciso
     y la acción o insumo externo necesario para su resolución final.
4. **Nunca** dejes en esta carpeta un archivo solo con items tachados: si todo
   su contenido está resuelto, el archivo ya no pertenece aquí.

## Historias con pendientes abiertos

| Historia | Archivo | Resumen pendiente |
| --- | --- | --- |
| E1 Registro con verificación por correo | `e1-registro-ciclista.md` | Envío real de correo verificado con Gmail SMTP (2026-10-17, ver `014`); restablecimiento de contraseña documentado con lo que se intentó. |
| E2 GPS como origen | `e2-gps-origen.md` | Alta precisión satelital y pruebas con Vitest resueltas (2026-10-17, ver `015` y `017`); verificación física en móvil documentada con lo que se intentó. |
| E2 Planificación de ruta | `e2-planificacion-ruta.md` | Ruta ORS de extremo a extremo verificada (2026-10-17, ver `014`); calidad de superficie / scoring documentado con lo que se intentó. |

