package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Base exception for business rule violations.
 *
 * <p>Translation layers (controllers/global handler) display the message verbatim to the
 * end user, so messages must be written in Spanish (UI language).
 */
public abstract class NegocioExcepcion extends RuntimeException {

    protected NegocioExcepcion(String mensaje) {
        super(mensaje);
    }
}
