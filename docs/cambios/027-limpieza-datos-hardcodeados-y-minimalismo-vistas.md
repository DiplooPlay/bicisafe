# 027: Limpieza de datos hardcodeados y aplicación estricta de minimalismo en vistas

## Fecha
2026-11-21

## Archivos
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Registro.tsx`
- `frontend/src/services/mockData.ts`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/layout/BottomNav.tsx`
- `frontend/src/components/incidentes/ValidarIncidentes.tsx`
- `frontend/src/components/incidentes/DenunciarIncidenteModal.tsx`
- `frontend/src/components/incidentes/DenunciarIncidenteModal.test.tsx`

## Qué se hizo
1. **Eliminación de métricas falsas y datos simulados en Login**:
   - Se removió por completo el panel lateral que mostraba cifras ficticias (`+15.4k activos`, `342 km verificadas`, `98.7% consenso`, `99.4% seguro`, `cifrado extremo a extremo`).
   - La pantalla de inicio de sesión se rediseñó como una tarjeta limpia y centrada (`max-w-md`), consistente con el resto de pantallas de autenticación.
2. **Eliminación de `safetyScore` hardcodeado en `mockData.ts`**:
   - Se removieron todas las propiedades estáticas `safetyScore` (98, 95, 88, 94, 91) de las ciclovías de Lima.
3. **Consistencia de textos breves (Regla 1: 1 a 3 palabras) y minimalismo (Regla 2)**:
   - **Registro**: Se eliminaron insignias decorativas y textos largos; etiquetas simplificadas a "Nombre", "Correo", "Contraseña".
   - **Navbar**: Enlaces directos de una palabra ("Mapa", "Validar", "Reportar", "Iniciar sesión").
   - **BottomNav**: Se corrigió el valor por defecto del contador de incidentes pendientes (`pendingCount = 0` en lugar de 2).
   - **ValidarIncidentes**: Pestañas breves ("Pendientes", "En disputa", "Confirmados", "Resueltos"), textos concisos y eliminación de párrafos redundantes.
   - **DenunciarIncidenteModal**: Títulos y botones concisos ("Denunciar incidente", "Enviar reporte", "Detalle (opcional)").

## Por qué
- La presencia de estadísticas simuladas en el login inducía a error y contravenía el principio de no alucinar métricas.
- La interfaz requería adherencia estricta a las reglas de concisión (1 a 3 palabras por elemento), legibilidad y minimalismo sin redundancias.

## Cómo se verificó
- `npm test -- --run` en frontend: 8 archivos y 13 pruebas ejecutadas y aprobadas (100% en verde).
- `npm run build`: compilación de TypeScript y empaquetado Vite exitosos sin advertencias ni errores.
- Verificación visual y de código de ausencia de métricas o porcentajes hardcodeados.
