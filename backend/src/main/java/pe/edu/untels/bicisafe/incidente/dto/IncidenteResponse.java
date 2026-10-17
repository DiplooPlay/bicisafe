package pe.edu.untels.bicisafe.incidente.dto;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import pe.edu.untels.bicisafe.incidente.domain.Incidente;

/**
 * Public response representation of a road incident.
 */
public record IncidenteResponse(
        UUID id,
        String categoria,
        String titulo,
        String descripcion,
        String ubicacionTexto,
        Double latitud,
        Double longitud,
        String fotoUrl,
        String autorNombre,
        int autorReputacion,
        String estado,
        int votosConfirmar,
        int votosRechazar,
        int votosRequeridos,
        long minutosRestantes,
        Instant fechaCreacion
) {
    public static IncidenteResponse desde(Incidente entidad) {
        long minutos = Math.max(0, Duration.between(Instant.now(), entidad.getFechaExpiracion()).toMinutes());
        return new IncidenteResponse(
                entidad.getId(),
                entidad.getCategoria().name().toLowerCase(),
                entidad.getTitulo(),
                entidad.getDescripcion(),
                entidad.getUbicacionTexto(),
                entidad.getLatitud(),
                entidad.getLongitud(),
                entidad.getFotoUrl(),
                entidad.getAutorNombre(),
                entidad.getAutorReputacion(),
                entidad.getEstado().name(),
                entidad.getVotosConfirmar(),
                entidad.getVotosRechazar(),
                entidad.getVotosRequeridos(),
                minutos,
                entidad.getFechaCreacion()
        );
    }
}
