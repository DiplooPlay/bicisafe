package pe.edu.untels.bicisafe.auth.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import pe.edu.untels.bicisafe.auth.domain.EstadoUsuario;
import pe.edu.untels.bicisafe.auth.domain.TokenRecuperacion;
import pe.edu.untels.bicisafe.auth.domain.Usuario;
import pe.edu.untels.bicisafe.auth.dto.RespuestaAutenticacion;
import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.dto.SolicitudLogin;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRecuperarPassword;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRestablecerPassword;
import pe.edu.untels.bicisafe.auth.repository.TokenRecuperacionRepository;
import pe.edu.untels.bicisafe.auth.repository.UsuarioRepository;
import pe.edu.untels.bicisafe.compartido.excepcion.CredencialesInvalidasExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.CuentaNoVerificadaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.TokenConfirmacionInvalidoExcepcion;
import pe.edu.untels.bicisafe.config.PropiedadesUrlFrontend;
import pe.edu.untels.bicisafe.config.security.JwtServicio;

/**
 * E1 business logic for credential login. Same generic error for unknown email and
 * wrong password to avoid leaking which accounts exist.
 */
@Service
public class ServicioAutenticacionImpl implements ServicioAutenticacion {

    private static final String MENSAJE_CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos.";
    private static final String TIPO_TOKEN = "Bearer";

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;
    private final ServicioCorreo servicioCorreo;
    private final PropiedadesUrlFrontend propiedadesUrlFrontend;

    public ServicioAutenticacionImpl(
            UsuarioRepository usuarioRepository,
            TokenRecuperacionRepository tokenRecuperacionRepository,
            PasswordEncoder passwordEncoder,
            JwtServicio jwtServicio,
            ServicioCorreo servicioCorreo,
            PropiedadesUrlFrontend propiedadesUrlFrontend) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRecuperacionRepository = tokenRecuperacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
        this.servicioCorreo = servicioCorreo;
        this.propiedadesUrlFrontend = propiedadesUrlFrontend;
    }

    @Override
    @Transactional(readOnly = true)
    public RespuestaAutenticacion iniciarSesion(SolicitudLogin solicitud) {
        String correoNormalizado = solicitud.correo().trim().toLowerCase();

        var usuario = usuarioRepository.findByCorreoIgnoreCase(correoNormalizado)
                .orElseThrow(() -> new CredencialesInvalidasExcepcion(MENSAJE_CREDENCIALES_INVALIDAS));

        if (usuario.getEstado() == EstadoUsuario.PENDIENTE_VERIFICACION) {
            throw new CuentaNoVerificadaExcepcion(
                    "Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.");
        }

        // A blocked account is reported as invalid credentials so the reason is not exposed.
        if (usuario.getEstado() == EstadoUsuario.BLOQUEADO
                || !passwordEncoder.matches(solicitud.password(), usuario.getHashPassword())) {
            throw new CredencialesInvalidasExcepcion(MENSAJE_CREDENCIALES_INVALIDAS);
        }

        String token = jwtServicio.generarToken(usuario);
        RespuestaUsuario usuarioRespuesta = RespuestaUsuario.desde(usuario);
        return new RespuestaAutenticacion(token, TIPO_TOKEN, jwtServicio.getExpiracionMinutos(), usuarioRespuesta);
    }

    @Override
    public void cerrarSesion(String token) {
        if (token != null && !token.isBlank()) {
            jwtServicio.invalidar(token);
        }
    }

    @Override
    @Transactional
    public void solicitarRecuperacionPassword(SolicitudRecuperarPassword solicitud) {
        String correoNormalizado = solicitud.correo().trim().toLowerCase();
        var optUsuario = usuarioRepository.findByCorreoIgnoreCase(correoNormalizado);
        if (optUsuario.isEmpty()) {
            return;
        }

        Usuario usuario = optUsuario.get();
        if (usuario.getEstado() == EstadoUsuario.BLOQUEADO) {
            return;
        }

        TokenRecuperacion token = TokenRecuperacion.generar(usuario);
        tokenRecuperacionRepository.save(token);

        String enlace = UriComponentsBuilder.fromUriString(propiedadesUrlFrontend.baseUrl())
                .queryParam("resetToken", token.getToken())
                .encode()
                .toUriString();

        servicioCorreo.enviarCorreoRecuperacion(usuario.getCorreo(), usuario.getNombre(), enlace);
    }

    @Override
    @Transactional
    public void restablecerPassword(SolicitudRestablecerPassword solicitud) {
        TokenRecuperacion token = tokenRecuperacionRepository.findByToken(solicitud.token())
                .orElseThrow(() -> new TokenConfirmacionInvalidoExcepcion(
                        "El enlace de recuperación no es válido o ya fue utilizado."));

        if (token.estaUsado()) {
            throw new TokenConfirmacionInvalidoExcepcion(
                    "El enlace de recuperación ya fue utilizado. Solicita uno nuevo.");
        }

        if (token.haExpirado(Instant.now())) {
            throw new TokenConfirmacionInvalidoExcepcion(
                    "El enlace de recuperación ha expirado. Los enlaces tienen una vigencia de 15 minutos.");
        }

        Usuario usuario = token.getUsuario();
        usuario.actualizarPassword(passwordEncoder.encode(solicitud.nuevaPassword()));
        token.marcarUsado(Instant.now());
        usuarioRepository.save(usuario);
    }
}

