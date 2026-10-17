package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when a request is understood but violates a rule (HTTP 400), e.g. plan a route
 * whose origin and destination are the same place.
 */
public class EntradaInvalidaExcepcion extends NegocioExcepcion {

    public EntradaInvalidaExcepcion(String mensaje) {
        super(mensaje);
    }
}
