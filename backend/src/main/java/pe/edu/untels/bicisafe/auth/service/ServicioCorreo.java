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

    /**
     * Sends the password reset email with a time-limited recovery link (HU-03).
     *
     * @param destinatario cyclist email
     * @param nombreCiclista cyclist display name
     * @param enlaceRecuperacion absolute URL to reset password
     */
    void enviarCorreoRecuperacion(String destinatario, String nombreCiclista, String enlaceRecuperacion);

    /**
     * Sends an email notification when an incident is confirmed near a saved route (HU-17).
     *
     * @param destinatario cyclist email
     * @param nombreCiclista cyclist display name
     * @param nombreRuta name of the affected saved route
     * @param categoriaIncidente incident category (e.g. obras, bache)
     * @param ubicacion incident textual location
     */
    void enviarAlertaIncidenteEnRuta(
            String destinatario,
            String nombreCiclista,
            String nombreRuta,
            String categoriaIncidente,
            String ubicacion);
}
