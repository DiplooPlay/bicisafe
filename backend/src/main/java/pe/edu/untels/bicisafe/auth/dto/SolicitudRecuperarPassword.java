package pe.edu.untels.bicisafe.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Payload for requesting a password reset email (HU-03).
 */
public record SolicitudRecuperarPassword(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo debe tener un formato válido")
        String correo
) {
}
