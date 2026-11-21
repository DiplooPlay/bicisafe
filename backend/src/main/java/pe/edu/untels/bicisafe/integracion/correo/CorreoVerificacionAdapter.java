package pe.edu.untels.bicisafe.integracion.correo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import pe.edu.untels.bicisafe.auth.service.ServicioCorreo;

/**
 * Gmail/SMTP adapter implementing the auth module port {@link ServicioCorreo}. It
 * delivers the email confirmation link in plain text (UI text in Spanish).
 *
 * <p>Sending is asynchronous and failures are logged (not rethrown): a temporary SMTP
 * outage must not break registration; the user can simply try again later.
 */
@Component
public class CorreoVerificacionAdapter implements ServicioCorreo {

    private static final Logger LOGGER = LoggerFactory.getLogger(CorreoVerificacionAdapter.class);

    private final JavaMailSender remitenteJava;
    private final String autor;

    public CorreoVerificacionAdapter(JavaMailSender remitenteJava, @Value("${app.mail.from}") String autor) {
        this.remitenteJava = remitenteJava;
        this.autor = autor;
    }

    @Override
    @Async
    public void enviarCorreoVerificacion(String destinatario, String nombreCiclista, String enlaceVerificacion) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(autor);
        mensaje.setTo(destinatario);
        mensaje.setSubject("BiciSafe: confirma tu cuenta");
        mensaje.setText(cuerpo(nombreCiclista, enlaceVerificacion));
        enviarMensaje(destinatario, mensaje, "verificación");
    }

    @Override
    @Async
    public void enviarCorreoRecuperacion(String destinatario, String nombreCiclista, String enlaceRecuperacion) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(autor);
        mensaje.setTo(destinatario);
        mensaje.setSubject("BiciSafe: restablece tu contraseña");
        mensaje.setText(cuerpoRecuperacion(nombreCiclista, enlaceRecuperacion));
        enviarMensaje(destinatario, mensaje, "recuperación de contraseña");
    }

    @Override
    @Async
    public void enviarAlertaIncidenteEnRuta(
            String destinatario,
            String nombreCiclista,
            String nombreRuta,
            String categoriaIncidente,
            String ubicacion) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(autor);
        mensaje.setTo(destinatario);
        mensaje.setSubject("BiciSafe: incidente en tu ruta " + nombreRuta);
        mensaje.setText(cuerpoAlerta(nombreCiclista, nombreRuta, categoriaIncidente, ubicacion));
        enviarMensaje(destinatario, mensaje, "alerta de ruta");
    }

    private void enviarMensaje(String destinatario, SimpleMailMessage mensaje, String tipo) {
        try {
            remitenteJava.send(mensaje);
            LOGGER.info("Correo de {} enviado a {}", tipo, destinatario);
        } catch (MailException excepcion) {
            LOGGER.error(
                    "No se pudo enviar el correo de {} a {}: {}",
                    tipo, destinatario, excepcion.getMessage());
        }
    }

    private String cuerpo(String nombreCiclista, String enlaceVerificacion) {
        return "Hola, " + nombreCiclista + ",\n\n"
                + "Gracias por registrarte en BiciSafe. Confirma tu correo electrónico "
                + "ingresando al siguiente enlace (válido por 24 horas):\n\n"
                + enlaceVerificacion + "\n\n"
                + "Si no creaste esta cuenta, ignora este mensaje.\n\n"
                + "El equipo de BiciSafe";
    }

    private String cuerpoRecuperacion(String nombreCiclista, String enlaceRecuperacion) {
        return "Hola, " + nombreCiclista + ",\n\n"
                + "Recibimos una solicitud para restablecer la contraseña de tu cuenta en BiciSafe.\n"
                + "Ingresa al siguiente enlace para definir una nueva contraseña (válido por 15 minutos):\n\n"
                + enlaceRecuperacion + "\n\n"
                + "Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.\n\n"
                + "El equipo de BiciSafe";
    }

    private String cuerpoAlerta(String nombreCiclista, String nombreRuta, String categoria, String ubicacion) {
        return "Hola, " + nombreCiclista + ",\n\n"
                + "Se confirmó un incidente de tipo " + categoria + " cerca de tu ruta guardada \"" + nombreRuta + "\".\n"
                + "Ubicación: " + ubicacion + "\n\n"
                + "Te sugerimos tomar precauciones o elegir un desvío.\n\n"
                + "El equipo de BiciSafe";
    }
}
