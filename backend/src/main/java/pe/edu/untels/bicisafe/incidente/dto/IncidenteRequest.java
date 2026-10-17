package pe.edu.untels.bicisafe.incidente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload sent by cyclists to report a new incident.
 */
public record IncidenteRequest(
        @NotBlank(message = "La categoría es obligatoria")
        String categoria,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 120, message = "El título no puede exceder 120 caracteres")
        String titulo,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 120, message = "La descripción no puede exceder 120 caracteres")
        String descripcion,

        @NotBlank(message = "La ubicación es obligatoria")
        @Size(max = 200, message = "La ubicación no puede exceder 200 caracteres")
        String ubicacionTexto,

        @NotNull(message = "La latitud es obligatoria")
        Double latitud,

        @NotNull(message = "La longitud es obligatoria")
        Double longitud,

        String fotoUrl
) {}
