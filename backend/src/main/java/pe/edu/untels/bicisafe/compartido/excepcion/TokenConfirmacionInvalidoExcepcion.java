package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when a confirmation token is unknown, already used or expired (HTTP 400).
 */
public class TokenConfirmacionInvalidoExcepcion extends NegocioExcepcion {

    public TokenConfirmacionInvalidoExcepcion(String mensaje) {
        super(mensaje);
    }
}
