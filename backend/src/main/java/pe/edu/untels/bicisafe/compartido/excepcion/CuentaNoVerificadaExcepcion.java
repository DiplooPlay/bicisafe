package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when an account performing an operation requires verification (HTTP 403).
 */
public class CuentaNoVerificadaExcepcion extends NegocioExcepcion {

    public CuentaNoVerificadaExcepcion(String mensaje) {
        super(mensaje);
    }
}
