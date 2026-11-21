package pe.edu.untels.bicisafe.auth.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.untels.bicisafe.auth.dto.PerfilUsuarioResponse;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.config.security.UsuarioAutenticado;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteResponse;
import pe.edu.untels.bicisafe.incidente.service.IncidenteService;

/**
 * Cyclist account management: session refresh, profile &amp; reputation (HU-04), and account deletion (RNF-10).
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    private final ServicioRegistro servicioRegistro;
    private final IncidenteService incidenteService;

    public UsuarioControlador(ServicioRegistro servicioRegistro, IncidenteService incidenteService) {
        this.servicioRegistro = servicioRegistro;
        this.incidenteService = incidenteService;
    }

    @GetMapping("/me")
    public RespuestaUsuario me(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        return servicioRegistro.obtenerPorId(usuario.id());
    }

    @GetMapping("/perfil")
    public PerfilUsuarioResponse perfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        RespuestaUsuario datos = servicioRegistro.obtenerPorId(usuario.id());
        List<IncidenteResponse> reportes = incidenteService.listarPorUsuario(usuario.id()).stream()
                .map(IncidenteResponse::desde)
                .toList();
        long total = incidenteService.contarPorUsuario(usuario.id());

        return new PerfilUsuarioResponse(
                datos.id(),
                datos.correo(),
                datos.nombre(),
                datos.rol(),
                datos.reputacion(),
                total,
                datos.fechaRegistro(),
                reportes
        );
    }

    @DeleteMapping("/me")
    public RespuestaMensaje eliminarCuenta(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        servicioRegistro.eliminarCuenta(usuario.id());
        return new RespuestaMensaje("Cuenta eliminada exitosamente.");
    }

    private void validarUsuario(UsuarioAutenticado usuario) {
        if (usuario == null) {
            throw new AccessDeniedException("Debes iniciar sesión para acceder a este recurso.");
        }
    }
}
