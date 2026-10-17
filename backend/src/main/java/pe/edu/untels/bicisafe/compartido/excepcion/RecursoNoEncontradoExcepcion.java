package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when a requested resource does not exist (HTTP 404).
 *
 * <p>The {@code campo} optionally identifies the request field that could not be resolved,
 * so the frontend can render the error next to it.
 */
public class RecursoNoEncontradoExcepcion extends NegocioExcepcion {

    private final String campo;

    public RecursoNoEncontradoExcepcion(String mensaje) {
        this(null, mensaje);
    }

    public RecursoNoEncontradoExcepcion(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
