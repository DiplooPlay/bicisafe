package pe.edu.untels.bicisafe.auth.domain;

/**
 * Lifecycle of a user account. A new registration starts as {@code PENDIENTE_VERIFICACION}
 * and becomes {@code ACTIVO} once the emailed verification link is confirmed.
 */
public enum EstadoUsuario {
    PENDIENTE_VERIFICACION,
    ACTIVO,
    BLOQUEADO
}
