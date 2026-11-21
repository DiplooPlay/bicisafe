package pe.edu.untels.bicisafe.incidente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload to report/flag an inappropriate incident (HU-14).
 */
public record SolicitudDenuncia(
        @NotBlank(message = "El motivo es obligatorio")
        String motivo,

        @Size(max = 200, message = "El comentario no puede exceder 200 caracteres")
        String comentario
) {
}
