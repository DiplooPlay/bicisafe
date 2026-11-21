# 028 - Ajustes Finales: Voto Único por Incidencia, Límite de Reputación y Simplificación UX

## 1. Contexto y Objetivos
En respuesta a las revisiones de diseño y reglas de negocio del ciclista urbano:
- **Consenso comunitario real**: Cada ciclista solo puede votar una única vez por reporte (1 voto por incidencia), impidiendo votos infinitos tanto en frontend como en base de datos (`incidente_voto`).
- **Techo de reputación**: La reputación máxima de un ciclista es de **20 puntos** (base inicial 15, máximo 20), corrigiendo la escala previa de 100 puntos.
- **Simplificación del buscador de rutas (Regla 1 - Concisión)**: Textos breves de 1 a 3 palabras. Encabezado "Rutas" (eliminando "Ciclovías de Lima"), botón "GPS", placeholders limpios ("Miraflores", "UNTELS") y botón "Calcular".
- **Filtros del mapa limpios**: Eliminación de chips no solicitados (`Segregadas`, `Vías 30`, `Alertas (0)`), manteniendo únicamente `Todo` y `Ruta` (HU-09).
- **Eliminación de control no funcional**: Se retiró el botón de alternancia entre mapa ciclista y estándar.
- **Perfil de usuario depurado**: Se eliminó la etiqueta de rango ("Ciclista Guardián") y la sección de "Eliminar mi cuenta" no solicitada.

---

## 2. Cambios Implementados

### Backend
1. **Entidad y Repositorio de Votos**:
   - `pe.edu.untels.bicisafe.incidente.domain.IncidenteVoto`: Mapeo JPA sobre la tabla `incidente_voto` creada en la migración `V3__incidente_y_votos.sql`.
   - `pe.edu.untels.bicisafe.incidente.repository.IncidenteVotoRepository`: Consultas `existsByIncidenteIdAndUsuarioId` y `existsByIncidenteIdAndVotanteId`.
2. **Lógica de Voto Único en Servicio**:
   - `IncidenteServiceImpl.java`:
     - Al reportar un incidente, se registra el voto inicial `CONFIRMAR` del autor.
     - `confirmarIncidente(UUID id, UUID usuarioId)` y `resolverIncidente(UUID id, UUID usuarioId)`: Validan si el usuario ya votó; si es así, lanzan `ValorDuplicadoExcepcion` (HTTP 409).
   - `IncidenteControlador.java`: Pasa `@AuthenticationPrincipal UsuarioAutenticado` a los endpoints `/{id}/confirmar` y `/{id}/resolver`.
3. **Límite de Reputación**:
   - `Usuario.java`: Método `sumarReputacion(int puntos)` con límite superior en 20: `Math.max(0, Math.min(20, this.reputacion + puntos))`.
4. **Pruebas Unitarias Backend**:
   - Nuevos tests en `IncidenteServiceTest.java`: `shouldRejectDuplicateVoteWhenConfirming()` y `shouldRejectDuplicateVoteWhenResolving()`. Total: **57 pruebas en verde**.

### Frontend
1. **Planificador de Rutas (`PlanificadorRuta.tsx`)**:
   - Título simplificado a "Rutas".
   - Subtítulo eliminado.
   - Enlace GPS: "GPS".
   - Placeholders: "Miraflores" y "UNTELS".
   - Botón: "Calcular".
2. **Filtros y Mapa Interactivo (`MapaInteractivo.tsx`)**:
   - Eliminados chips `Segregadas`, `Vías 30`, `Alertas`.
   - Mantenidos `Todo` y `Ruta`.
   - Eliminado botón de alternar mapa ciclista.
   - Soporte para deshabilitar botones de voto si el usuario ya votó en la incidencia seleccionada.
3. **Consenso y Validación (`ValidarIncidentes.tsx` & `App.tsx`)**:
   - Escala de reputación actualizada a `/ 20 pts` con barra proporcional.
   - Persistencia local de votos emitidos en `localStorage` (`bicisafe_votos`).
   - Botones de acción deshabilitados con estado "Votado (Confirmado / Resuelto)" una vez emitido el voto.
4. **Perfil (`Perfil.tsx`)**:
   - Eliminado badge "Ciclista Guardián".
   - Eliminada sección "Eliminar mi cuenta".
   - Indicador de reputación actualizado a `Máx. 20 pts`.
5. **Pruebas Frontend**:
   - `PlanificadorRuta.test.tsx` actualizado para reflejar los nuevos textos.
   - Total: **8 archivos de prueba, 13 pruebas en verde**.
   - Build de producción (`npm run build`) 100% exitoso sin errores de TypeScript ni Vite.

---

## 3. Estado de Calidad y GitFlow
- **Backend**: 57 tests passed, 0 failures, 0 errors.
- **Frontend**: 13 tests passed, 0 failures. Compilación Vite correcta.
- **GitFlow**: Todas las historias organizadas en ramas `feature/` y fusionadas en `develop` vía PRs limpios.
