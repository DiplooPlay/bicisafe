package pe.edu.untels.bicisafe.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.config.security.UsuarioAutenticado;

/**
 * E1 endpoint for the session owner; keeps the frontend session fresh while navigating.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

    private final ServicioRegistro servicioRegistro;

    public UsuarioControlador(ServicioRegistro servicioRegistro) {
        this.servicioRegistro = servicioRegistro;
    }

    @GetMapping("/me")
    public RespuestaUsuario me(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return servicioRegistro.obtenerPorId(usuario.id());
    }
}
