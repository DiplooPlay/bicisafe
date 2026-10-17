package pe.edu.untels.bicisafe.auth.service;

import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRegistro;

/**
 * Auth module internal API for account lifecycle (register + verification).
 *
 * <p>Other modules must depend on this interface, never on the implementation.
 */
public interface ServicioRegistro {

    /**
     * Registers a visitor with a unique valid email. Creates the account as
     * {@code PENDIENTE_VERIFICACION} and sends the verification email.
     *
     * @param solicitud validated registration input
     * @return user-facing success message
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.ValorDuplicadoExcepcion if the email is taken
     */
    RespuestaMensaje registrar(SolicitudRegistro solicitud);

    /**
     * Confirms the account with the emailed token, activating it for login.
     *
     * @param token confirmation token from the email link
     * @return user-facing success message
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.TokenConfirmacionInvalidoExcepcion
     *         if the token is unknown, used or expired
     */
    RespuestaMensaje verificarCorreo(String token);

    /**
     * Internal lookup used by other modules (incident reports, saved routes, admin).
     *
     * @param id cyclist id
     * @return user projection
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion if missing
     */
    RespuestaUsuario obtenerPorId(java.util.UUID id);
}
