package pe.edu.untels.bicisafe.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.untels.bicisafe.auth.domain.EstadoUsuario;
import pe.edu.untels.bicisafe.auth.dto.RespuestaAutenticacion;
import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.dto.SolicitudLogin;
import pe.edu.untels.bicisafe.auth.repository.UsuarioRepository;
import pe.edu.untels.bicisafe.compartido.excepcion.CredencialesInvalidasExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.CuentaNoVerificadaExcepcion;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;

    public ServicioAutenticacionImpl(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtServicio jwtServicio) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
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
}

