package pe.edu.untels.bicisafe.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload for setting a new password using a recovery token (HU-03).
 */
public record SolicitudRestablecerPassword(
        @NotBlank(message = "El token es obligatorio")
        String token,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        String nuevaPassword
) {
}
