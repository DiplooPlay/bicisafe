package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when the presented credentials are wrong (HTTP 401).
 */
public class CredencialesInvalidasExcepcion extends NegocioExcepcion {

    public CredencialesInvalidasExcepcion(String mensaje) {
        super(mensaje);
    }
}
