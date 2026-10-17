package pe.edu.untels.bicisafe.config.security;

import java.util.UUID;

import pe.edu.untels.bicisafe.auth.domain.RolUsuario;

/**
 * Authenticated principal extracted from a valid JWT; used as the security context
 * principal and passed to controllers via {@code @AuthenticationPrincipal}.
 */
public record UsuarioAutenticado(UUID id, String correo, RolUsuario rol) {
}
