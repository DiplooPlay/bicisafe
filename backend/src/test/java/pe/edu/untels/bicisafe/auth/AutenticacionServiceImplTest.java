package pe.edu.untels.bicisafe.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import pe.edu.untels.bicisafe.auth.domain.TokenRecuperacion;
import pe.edu.untels.bicisafe.auth.domain.Usuario;
import pe.edu.untels.bicisafe.auth.dto.RespuestaAutenticacion;
import pe.edu.untels.bicisafe.auth.dto.SolicitudLogin;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRecuperarPassword;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRestablecerPassword;
import pe.edu.untels.bicisafe.auth.repository.TokenRecuperacionRepository;
import pe.edu.untels.bicisafe.auth.repository.UsuarioRepository;
import pe.edu.untels.bicisafe.auth.service.ServicioAutenticacionImpl;
import pe.edu.untels.bicisafe.auth.service.ServicioCorreo;
import pe.edu.untels.bicisafe.compartido.excepcion.CredencialesInvalidasExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.CuentaNoVerificadaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.TokenConfirmacionInvalidoExcepcion;
import pe.edu.untels.bicisafe.config.PropiedadesUrlFrontend;
import pe.edu.untels.bicisafe.config.security.JwtPropiedades;
import pe.edu.untels.bicisafe.config.security.JwtServicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutenticacionServiceImplTest {

    private static final String CLAVE_CORRECTA = "bicisafe-contrasena-123";

    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final TokenRecuperacionRepository tokenRecuperacionRepository = mock(TokenRecuperacionRepository.class);
    private final ServicioCorreo servicioCorreo = mock(ServicioCorreo.class);
    private final PropiedadesUrlFrontend propiedadesUrlFrontend = new PropiedadesUrlFrontend("http://localhost:3000");
    private final JwtServicio jwtServicio = new JwtServicio(new JwtPropiedades(
            "clave-de-prueba-con-mas-de-32-bytes-0123456789", 60, "bicisafe"));
    private final ServicioAutenticacionImpl servicio = new ServicioAutenticacionImpl(
            usuarioRepository,
            tokenRecuperacionRepository,
            new BCryptPasswordEncoder(),
            jwtServicio,
            servicioCorreo,
            propiedadesUrlFrontend);

    @Test
    @DisplayName("iniciar sesión con credenciales válidas de una cuenta activa")
    void shouldLogInWithValidCredentials() {
        Usuario activo = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        activo.activar();
        activo.setId(UUID.randomUUID());
        activo.setHashPassword(new BCryptPasswordEncoder().encode(CLAVE_CORRECTA));
        when(usuarioRepository.findByCorreoIgnoreCase("ana@correo.com")).thenReturn(Optional.of(activo));

        RespuestaAutenticacion respuesta = servicio.iniciarSesion(
                new SolicitudLogin("ana@correo.com", CLAVE_CORRECTA));

        assertThat(respuesta.token()).isNotBlank();
        assertThat(respuesta.usuario().correo()).isEqualTo("ana@correo.com");
    }

    @Test
    @DisplayName("rechazar el inicio de sesión con la contraseña incorrecta")
    void shouldRejectWrongPassword() {
        Usuario activo = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        activo.activar();
        activo.setHashPassword(new BCryptPasswordEncoder().encode(CLAVE_CORRECTA));
        when(usuarioRepository.findByCorreoIgnoreCase("ana@correo.com")).thenReturn(Optional.of(activo));

        assertThatThrownBy(() -> servicio.iniciarSesion(new SolicitudLogin("ana@correo.com", "otra-clave-999")))
                .isInstanceOf(CredencialesInvalidasExcepcion.class)
                .hasMessageContaining("incorrectos");
    }

    @Test
    @DisplayName("rechazar el inicio de sesión cuando el correo no existe")
    void shouldRejectUnknownEmail() {
        when(usuarioRepository.findByCorreoIgnoreCase("desconocido@correo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.iniciarSesion(new SolicitudLogin("desconocido@correo.com", CLAVE_CORRECTA)))
                .isInstanceOf(CredencialesInvalidasExcepcion.class);
    }

    @Test
    @DisplayName("rechazar el inicio de sesión con la cuenta pendiente de verificación")
    void shouldRejectUnverifiedAccount() {
        Usuario pendiente = Usuario.nuevoPendiente(
                "pendiente@correo.com", new BCryptPasswordEncoder().encode(CLAVE_CORRECTA), "Ana");
        when(usuarioRepository.findByCorreoIgnoreCase("pendiente@correo.com")).thenReturn(Optional.of(pendiente));

        assertThatThrownBy(() -> servicio.iniciarSesion(new SolicitudLogin("pendiente@correo.com", CLAVE_CORRECTA)))
                .isInstanceOf(CuentaNoVerificadaExcepcion.class)
                .hasMessageContaining("confirmar");
    }

    @Test
    @DisplayName("rechazar el inicio de sesión con una cuenta bloqueada")
    void shouldRejectBlockedAccount() {
        Usuario bloqueado = Usuario.nuevoPendiente("bloqueado@correo.com", "hash", "Ana");
        bloqueado.activar();
        bloqueado.bloquear();
        bloqueado.setHashPassword(new BCryptPasswordEncoder().encode(CLAVE_CORRECTA));
        when(usuarioRepository.findByCorreoIgnoreCase("bloqueado@correo.com")).thenReturn(Optional.of(bloqueado));

        assertThatThrownBy(() -> servicio.iniciarSesion(new SolicitudLogin("bloqueado@correo.com", CLAVE_CORRECTA)))
                .isInstanceOf(CredencialesInvalidasExcepcion.class);
    }

    @Test
    @DisplayName("cerrar sesión invalida el token para peticiones futuras")
    void shouldInvalidateTokenOnLogout() {
        Usuario activo = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        activo.activar();
        activo.setId(UUID.randomUUID());
        activo.setHashPassword(new BCryptPasswordEncoder().encode(CLAVE_CORRECTA));
        when(usuarioRepository.findByCorreoIgnoreCase("ana@correo.com")).thenReturn(Optional.of(activo));

        RespuestaAutenticacion respuesta = servicio.iniciarSesion(
                new SolicitudLogin("ana@correo.com", CLAVE_CORRECTA));
        String token = respuesta.token();

        assertThat(jwtServicio.validar(token)).isPresent();

        servicio.cerrarSesion(token);

        assertThat(jwtServicio.validar(token)).isEmpty();
    }

    @Test
    @DisplayName("solicitar recuperación de contraseña genera token y envía correo")
    void shouldSendRecoveryEmailWhenRequested() {
        Usuario activo = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        activo.activar();
        when(usuarioRepository.findByCorreoIgnoreCase("ana@correo.com")).thenReturn(Optional.of(activo));

        servicio.solicitarRecuperacionPassword(new SolicitudRecuperarPassword("ana@correo.com"));

        verify(tokenRecuperacionRepository).save(any(TokenRecuperacion.class));
        verify(servicioCorreo).enviarCorreoRecuperacion(eq("ana@correo.com"), eq("Ana"), any(String.class));
    }

    @Test
    @DisplayName("solicitar recuperación para correo inexistente no falla ni envía correo")
    void shouldHandleNonExistentEmailGracefully() {
        when(usuarioRepository.findByCorreoIgnoreCase("inexistente@correo.com")).thenReturn(Optional.empty());

        servicio.solicitarRecuperacionPassword(new SolicitudRecuperarPassword("inexistente@correo.com"));
    }

    @Test
    @DisplayName("restablecer contraseña con token válido actualiza el hash")
    void shouldResetPasswordWithValidToken() {
        Usuario usuario = Usuario.nuevoPendiente("ana@correo.com", "hashViejo", "Ana");
        usuario.activar();

        TokenRecuperacion token = TokenRecuperacion.generar(usuario);
        when(tokenRecuperacionRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));

        servicio.restablecerPassword(new SolicitudRestablecerPassword(token.getToken(), "nuevaClaveSegura123"));

        assertThat(token.estaUsado()).isTrue();
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("restablecer contraseña con token expirado lanza excepción")
    void shouldRejectExpiredRecoveryToken() {
        Usuario usuario = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        TokenRecuperacion token = TokenRecuperacion.generar(usuario);
        token.setFechaExpiracion(Instant.now().minus(1, ChronoUnit.MINUTES));
        when(tokenRecuperacionRepository.findByToken("token-expirado")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> servicio.restablecerPassword(
                new SolicitudRestablecerPassword("token-expirado", "nuevaClave123")))
                .isInstanceOf(TokenConfirmacionInvalidoExcepcion.class)
                .hasMessageContaining("expirado");
    }

    @Test
    @DisplayName("restablecer contraseña con token ya usado lanza excepción")
    void shouldRejectUsedRecoveryToken() {
        Usuario usuario = Usuario.nuevoPendiente("ana@correo.com", "hash", "Ana");
        TokenRecuperacion token = TokenRecuperacion.generar(usuario);
        token.marcarUsado(Instant.now());
        when(tokenRecuperacionRepository.findByToken("token-usado")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> servicio.restablecerPassword(
                new SolicitudRestablecerPassword("token-usado", "nuevaClave123")))
                .isInstanceOf(TokenConfirmacionInvalidoExcepcion.class)
                .hasMessageContaining("utilizado");
    }
}
