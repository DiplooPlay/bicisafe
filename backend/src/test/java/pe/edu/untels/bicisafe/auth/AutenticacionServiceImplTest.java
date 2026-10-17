package pe.edu.untels.bicisafe.auth;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import pe.edu.untels.bicisafe.auth.domain.Usuario;
import pe.edu.untels.bicisafe.auth.dto.RespuestaAutenticacion;
import pe.edu.untels.bicisafe.auth.dto.SolicitudLogin;
import pe.edu.untels.bicisafe.auth.repository.UsuarioRepository;
import pe.edu.untels.bicisafe.auth.service.ServicioAutenticacionImpl;
import pe.edu.untels.bicisafe.compartido.excepcion.CredencialesInvalidasExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.CuentaNoVerificadaExcepcion;
import pe.edu.untels.bicisafe.config.security.JwtPropiedades;
import pe.edu.untels.bicisafe.config.security.JwtServicio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AutenticacionServiceImplTest {

    private static final String CLAVE_CORRECTA = "bicisafe-contrasena-123";

    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final JwtServicio jwtServicio = new JwtServicio(new JwtPropiedades(
            "clave-de-prueba-con-mas-de-32-bytes-0123456789", 60, "bicisafe"));
    private final ServicioAutenticacionImpl servicio = new ServicioAutenticacionImpl(
            usuarioRepository, new BCryptPasswordEncoder(), jwtServicio);

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
}
