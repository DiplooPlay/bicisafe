package pe.edu.untels.bicisafe.auth.service;

import pe.edu.untels.bicisafe.auth.dto.RespuestaAutenticacion;
import pe.edu.untels.bicisafe.auth.dto.SolicitudLogin;

/**
 * Auth module internal API for credential login (E1). Issues the JWT exposed by
 * {@code config.security}.
 */
public interface ServicioAutenticacion {

    /**
     * Verifies the credentials and returns a signed JWT active for
     * {@code app.jwt.expiration-minutes}.
     *
     * @param solicitud validated login input
     * @return token + cyclist data
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.CredencialesInvalidasExcepcion
     *         when the email or password do not match
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.CuentaNoVerificadaExcepcion
     *         when the account is still pending email verification
     */
    RespuestaAutenticacion iniciarSesion(SolicitudLogin solicitud);

    /**
     * Invalidates the given JWT in the blacklist.
     *
     * @param token JWT token to invalidate
     */
    void cerrarSesion(String token);
}

