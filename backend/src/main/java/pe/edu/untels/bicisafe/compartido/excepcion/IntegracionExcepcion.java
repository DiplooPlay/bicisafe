package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when an external service (ORS, Nominatim, SMTP) is unreachable or returns an
 * unusable response (HTTP 502).
 */
public class IntegracionExcepcion extends NegocioExcepcion {

    public IntegracionExcepcion(String mensaje) {
        super(mensaje);
    }
}
