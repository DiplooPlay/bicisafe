package pe.edu.untels.bicisafe.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * E1 registration request (visitor creates an account).
 *
 * @param correo    unique, format-validated email (lowercased by the service)
 * @param password  at least 8 characters
 * @param nombre    display name shown in the app
 */
public record SolicitudRegistro(
        @NotBlank(message = "Ingresa tu correo electrónico.")
        @Email(message = "Ingresa un correo electrónico válido.")
        String correo,
        @NotBlank(message = "Ingresa una contraseña.")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres.")
        String password,
        @NotBlank(message = "Ingresa tu nombre.")
        @Size(max = 120, message = "El nombre es demasiado largo.")
        String nombre) {
}
