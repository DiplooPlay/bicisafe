package pe.edu.untels.bicisafe.auth;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import pe.edu.untels.bicisafe.auth.domain.EstadoUsuario;
import pe.edu.untels.bicisafe.auth.domain.TokenVerificacion;
import pe.edu.untels.bicisafe.auth.domain.Usuario;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRegistro;
import pe.edu.untels.bicisafe.auth.repository.TokenVerificacionRepository;
import pe.edu.untels.bicisafe.auth.repository.UsuarioRepository;
import pe.edu.untels.bicisafe.auth.service.ServicioCorreo;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistroImpl;
import pe.edu.untels.bicisafe.compartido.excepcion.TokenConfirmacionInvalidoExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.ValorDuplicadoExcepcion;
import pe.edu.untels.bicisafe.config.PropiedadesUrlFrontend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegistroServiceImplTest {

    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final TokenVerificacionRepository tokenRepository = mock(TokenVerificacionRepository.class);
    private final ServicioCorreo servicioCorreo = mock(ServicioCorreo.class);
    private final ServicioRegistroImpl servicio = new ServicioRegistroImpl(
            usuarioRepository, tokenRepository, new BCryptPasswordEncoder(),
            servicioCorreo, new PropiedadesUrlFrontend("http://localhost:5173"));

    @Test
    @DisplayName("registrarse y enviar el correo con el enlace de verificación")
    void shouldKeepAccountPendingAndSendVerificationLink() {
        when(usuarioRepository.existsByCorreoIgnoreCase("ana@correo.com")).thenReturn(false);

        servicio.registrar(new SolicitudRegistro("ana@correo.com", "contrasenasseguras", "Ana"));

        ArgumentCaptor<Usuario> capturaUsuario = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(capturaUsuario.capture());
        Usuario guardado = capturaUsuario.getValue();
        assertThat(guardado.getEstado()).isEqualTo(EstadoUsuario.PENDIENTE_VERIFICACION);
        assertThat(guardado.getCorreo()).isEqualTo("ana@correo.com");

        ArgumentCaptor<String> capturaEnlace = ArgumentCaptor.forClass(String.class);
        verify(servicioCorreo).enviarCorreoVerificacion(any(), any(), capturaEnlace.capture());
        assertThat(capturaEnlace.getValue()).startsWith("http://localhost:5173").contains("token=");
    }

    @Test
    @DisplayName("rechazar el registro con un correo ya registrado")
    void shouldRejectDuplicateEmailRegistration() {
        when(usuarioRepository.existsByCorreoIgnoreCase("ana@correo.com")).thenReturn(true);

        assertThatThrownBy(() -> servicio.registrar(new SolicitudRegistro("ana@correo.com", "contrasena123", "Ana")))
                .isInstanceOf(ValorDuplicadoExcepcion.class)
                .hasMessageContaining("ya está registrado");

        verify(servicioCorreo, never()).enviarCorreoVerificacion(any(), any(), any());
    }

    @Test
    @DisplayName("confirmar el correo con un token válido y activar la cuenta")
    void shouldActivateAccountWithValidToken() {
        Usuario pendiente = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        TokenVerificacion token = TokenVerificacion.generar(pendiente);
        when(tokenRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));

        var respuesta = servicio.verificarCorreo(token.getToken());

        assertThat(pendiente.estaActivo()).isTrue();
        assertThat(token.estaUsado()).isTrue();
        assertThat(respuesta.mensaje()).contains("puedes iniciar sesión");
    }

    @Test
    @DisplayName("rechazar un token de verificación expirado")
    void shouldRejectExpiredToken() {
        Usuario pendiente = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        TokenVerificacion token = TokenVerificacion.generar(pendiente);
        token.setFechaExpiracion(Instant.now().minusSeconds(60));
        when(tokenRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> servicio.verificarCorreo(token.getToken()))
                .isInstanceOf(TokenConfirmacionInvalidoExcepcion.class)
                .hasMessageContaining("expiró");
    }

    @Test
    @DisplayName("rechazar un token ya usado")
    void shouldRejectUsedToken() {
        Usuario pendiente = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        TokenVerificacion token = TokenVerificacion.generar(pendiente);
        token.marcarUsado(Instant.now());
        when(tokenRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> servicio.verificarCorreo(token.getToken()))
                .isInstanceOf(TokenConfirmacionInvalidoExcepcion.class)
                .hasMessageContaining("ya fue usado");
    }
}
