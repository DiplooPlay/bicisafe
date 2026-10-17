package pe.edu.untels.bicisafe.auth.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import pe.edu.untels.bicisafe.auth.domain.TokenVerificacion;
import pe.edu.untels.bicisafe.auth.domain.Usuario;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRegistro;
import pe.edu.untels.bicisafe.auth.repository.TokenVerificacionRepository;
import pe.edu.untels.bicisafe.auth.repository.UsuarioRepository;
import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;

import pe.edu.untels.bicisafe.config.PropiedadesUrlFrontend;import pe.edu.untels.bicisafe.compartido.excepcion.TokenConfirmacionInvalidoExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.ValorDuplicadoExcepcion;

/**
 * E1 business logic: registration with unique email, verification email dispatch and
 * account activation.
 */
@Service
public class ServicioRegistroImpl implements ServicioRegistro {

    private static final String MENSAJE_REGISTRO_EXITOSO =
            "Registro exitoso. Te enviamos un correo para confirmar tu cuenta.";

    private final UsuarioRepository usuarioRepository;
    private final TokenVerificacionRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServicioCorreo servicioCorreo;
    private final PropiedadesUrlFrontend propiedadesUrlFrontend;

    public ServicioRegistroImpl(
            UsuarioRepository usuarioRepository,
            TokenVerificacionRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            ServicioCorreo servicioCorreo,
            PropiedadesUrlFrontend propiedadesUrlFrontend) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.servicioCorreo = servicioCorreo;
        this.propiedadesUrlFrontend = propiedadesUrlFrontend;
    }

    @Override
    @Transactional
    public RespuestaMensaje registrar(SolicitudRegistro solicitud) {
        String correoNormalizado = solicitud.correo().trim().toLowerCase();

        if (usuarioRepository.existsByCorreoIgnoreCase(correoNormalizado)) {
            throw new ValorDuplicadoExcepcion("correo", "Este correo ya está registrado. Inicia sesión o usa otro correo.");
        }

        Usuario usuario = Usuario.nuevoPendiente(
                correoNormalizado,
                passwordEncoder.encode(solicitud.password()),
                solicitud.nombre().trim());
        usuarioRepository.save(usuario);

        enviarCorreoVerificacion(usuario);
        return new RespuestaMensaje(MENSAJE_REGISTRO_EXITOSO);
    }

    @Override
    @Transactional
    public RespuestaMensaje verificarCorreo(String token) {
        TokenVerificacion tokenVerificacion = tokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenConfirmacionInvalidoExcepcion(
                        "El enlace de verificación no es válido o ya fue usado."));

        if (tokenVerificacion.estaUsado()) {
            throw new TokenConfirmacionInvalidoExcepcion(
                    "El enlace de verificación no es válido o ya fue usado. Intenta iniciar sesión.");
        }
        if (tokenVerificacion.haExpirado(Instant.now())) {
            throw new TokenConfirmacionInvalidoExcepcion(
                    "El enlace de verificación expiró. Regístrate de nuevo para recibir otro correo.");
        }

        tokenVerificacion.getUsuario().activar();
        tokenVerificacion.marcarUsado(Instant.now());
        return new RespuestaMensaje("¡Correo confirmado! Tu cuenta está activa. Ya puedes iniciar sesión.");
    }

    @Override
    @Transactional(readOnly = true)
    public RespuestaUsuario obtenerPorId(java.util.UUID id) {
        return usuarioRepository.findById(id)
                .map(RespuestaUsuario::desde)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id",
                        "No existe una cuenta con el usuario indicado."));
    }

    private void enviarCorreoVerificacion(Usuario usuario) {
        TokenVerificacion token = TokenVerificacion.generar(usuario);
        tokenRepository.save(token);

        String enlace = UriComponentsBuilder.fromUriString(propiedadesUrlFrontend.baseUrl())
                .queryParam("token", token.getToken())
                .encode()
                .toUriString();
        servicioCorreo.enviarCorreoVerificacion(usuario.getCorreo(), usuario.getNombre(), enlace);
    }
}
