package pe.edu.untels.bicisafe.ruta.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.config.security.UsuarioAutenticado;
import pe.edu.untels.bicisafe.ruta.dto.GuardarRutaRequest;
import pe.edu.untels.bicisafe.ruta.dto.RutaGuardadaResponse;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutaGuardada;

/**
 * Controller for managing cyclist saved frequent routes (HU-16).
 */
@RestController
@RequestMapping("/api/rutas/guardadas")
public class RutaGuardadaControlador {

    private final ServicioRutaGuardada servicioRutaGuardada;

    public RutaGuardadaControlador(ServicioRutaGuardada servicioRutaGuardada) {
        this.servicioRutaGuardada = servicioRutaGuardada;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RutaGuardadaResponse guardarRuta(
            @Valid @RequestBody GuardarRutaRequest solicitud,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        return servicioRutaGuardada.guardarRuta(usuario.id(), solicitud);
    }

    @GetMapping
    public List<RutaGuardadaResponse> listarRutas(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        return servicioRutaGuardada.listarRutas(usuario.id());
    }

    @GetMapping("/{id}")
    public RutaGuardadaResponse obtenerRuta(
            @PathVariable UUID id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        return servicioRutaGuardada.obtenerRuta(id, usuario.id());
    }

    @DeleteMapping("/{id}")
    public RespuestaMensaje eliminarRuta(
            @PathVariable UUID id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        validarUsuario(usuario);
        servicioRutaGuardada.eliminarRuta(id, usuario.id());
        return new RespuestaMensaje("Ruta frecuente eliminada.");
    }

    private void validarUsuario(UsuarioAutenticado usuario) {
        if (usuario == null) {
            throw new AccessDeniedException("Debes iniciar sesión para acceder a este recurso.");
        }
    }
}
