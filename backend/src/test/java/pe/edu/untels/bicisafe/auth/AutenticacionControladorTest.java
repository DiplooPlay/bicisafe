package pe.edu.untels.bicisafe.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import pe.edu.untels.bicisafe.auth.controller.AutenticacionControlador;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRecuperarPassword;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRestablecerPassword;
import pe.edu.untels.bicisafe.auth.service.ServicioAutenticacion;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AutenticacionControladorTest {

    private final ServicioRegistro servicioRegistro = mock(ServicioRegistro.class);
    private final ServicioAutenticacion servicioAutenticacion = mock(ServicioAutenticacion.class);
    private final AutenticacionControlador controlador = new AutenticacionControlador(servicioRegistro, servicioAutenticacion);

    @Test
    @DisplayName("solicitar restablecimiento de contraseña responde mensaje de confirmación (HU-03)")
    void shouldReturnConfirmationMessageOnPasswordRecoveryRequest() {
        SolicitudRecuperarPassword solicitud = new SolicitudRecuperarPassword("ciclista@correo.com");

        ResponseEntity<RespuestaMensaje> respuesta = controlador.solicitarRecuperacionPassword(solicitud);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody().mensaje()).contains("recibirás un enlace de recuperación");
        verify(servicioAutenticacion).solicitarRecuperacionPassword(solicitud);
    }

    @Test
    @DisplayName("restablecer contraseña responde confirmación de cambio (HU-03)")
    void shouldConfirmPasswordReset() {
        SolicitudRestablecerPassword solicitud = new SolicitudRestablecerPassword("token-valido", "nuevaClave123");

        ResponseEntity<RespuestaMensaje> respuesta = controlador.restablecerPassword(solicitud);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody().mensaje()).contains("actualizada exitosamente");
        verify(servicioAutenticacion).restablecerPassword(solicitud);
    }
}
