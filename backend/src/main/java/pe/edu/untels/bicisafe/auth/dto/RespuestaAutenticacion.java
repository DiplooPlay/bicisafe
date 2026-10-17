package pe.edu.untels.bicisafe.auth.dto;

/**
 * E1 login response: stateless JWT plus the authenticated cyclist.
 */
public record RespuestaAutenticacion(String token, String tipoToken, long expiracionMinutos, RespuestaUsuario usuario) {
}
