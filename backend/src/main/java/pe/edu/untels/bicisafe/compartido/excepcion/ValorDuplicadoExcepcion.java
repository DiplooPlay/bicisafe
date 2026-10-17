package pe.edu.untels.bicisafe.compartido.excepcion;

/**
 * Thrown when trying to create/modify a resource that already exists (HTTP 409).
 *
 * <p>{@code campo} names the conflicting request field (e.g. {@code correo}) so the
 * frontend can render the error message next to that field.
 */
public class ValorDuplicadoExcepcion extends NegocioExcepcion {

    private final String campo;

    public ValorDuplicadoExcepcion(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
