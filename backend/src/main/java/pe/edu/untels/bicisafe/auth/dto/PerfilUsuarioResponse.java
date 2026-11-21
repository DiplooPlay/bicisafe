package pe.edu.untels.bicisafe.auth.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import pe.edu.untels.bicisafe.incidente.dto.IncidenteResponse;

/**
 * Cyclist profile including reputation and incident history (HU-04).
 */
public record PerfilUsuarioResponse(
        UUID id,
        String correo,
        String nombre,
        String rol,
        int reputacion,
        long totalReportes,
        Instant fechaRegistro,
        List<IncidenteResponse> historialReportes
) {
}
