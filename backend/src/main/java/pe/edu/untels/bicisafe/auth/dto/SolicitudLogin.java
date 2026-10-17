package pe.edu.untels.bicisafe.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * E1 login request.
 *
 * @param correo    cyclist email
 * @param password  cyclist password
 */
public record SolicitudLogin(
        @NotBlank(message = "Ingresa tu correo electrónico.")
        @Email(message = "Ingresa un correo electrónico válido.")
        String correo,
        @NotBlank(message = "Ingresa tu contraseña.")
        String password) {
}
