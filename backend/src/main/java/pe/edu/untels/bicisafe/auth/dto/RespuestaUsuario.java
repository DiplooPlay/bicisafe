package pe.edu.untels.bicisafe.auth.dto;

import java.util.UUID;

import pe.edu.untels.bicisafe.auth.domain.Usuario;

/**
 * Safe projection of a {@link Usuario} (never leaks the password hash).
 */
public record RespuestaUsuario(UUID id, String correo, String nombre, String rol, String estado) {

    public static RespuestaUsuario desde(Usuario usuario) {
        return new RespuestaUsuario(
                usuario.getId(),
                usuario.getCorreo(),
                usuario.getNombre(),
                usuario.getRol().name(),
                usuario.getEstado().name());
    }
}
