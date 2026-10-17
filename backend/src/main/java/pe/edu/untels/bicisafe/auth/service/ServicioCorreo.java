package pe.edu.untels.bicisafe.auth.service;

/**
 * Port (driven interface) used by the auth module to deliver the account verification
 * email. Implemented by the {@code integration.correo} adapter (ports &amp; adapters);
 * the circular dependency is avoided by placing the interface in the module's {@code service} package.
 */
public interface ServicioCorreo {

    /**
     * Sends the verification email containing the confirmation link.
     *
     * @param destinatario cyclist email
     * @param nombreCiclista cyclist display name, used in the greeting
     * @param enlaceVerificacion absolute URL of the frontend confirmation screen
     */
    void enviarCorreoVerificacion(String destinatario, String nombreCiclista, String enlaceVerificacion);
}
