package pe.edu.untels.bicisafe.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.edu.untels.bicisafe.auth.dto.RespuestaAutenticacion;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.auth.dto.SolicitudLogin;
import pe.edu.untels.bicisafe.auth.dto.SolicitudRegistro;
import pe.edu.untels.bicisafe.auth.service.ServicioAutenticacion;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;

/**
 * E1 endpoints: registration, email verification and login (both public).
 */
@RestController
@RequestMapping("/api/auth")
public class AutenticacionControlador {

    private final ServicioRegistro servicioRegistro;
    private final ServicioAutenticacion servicioAutenticacion;

    public AutenticacionControlador(ServicioRegistro servicioRegistro, ServicioAutenticacion servicioAutenticacion) {
        this.servicioRegistro = servicioRegistro;
        this.servicioAutenticacion = servicioAutenticacion;
    }

    @PostMapping("/registro")
    public ResponseEntity<RespuestaMensaje> registrar(@Valid @RequestBody SolicitudRegistro solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicioRegistro.registrar(solicitud));
    }

    /** Confirmation target of the link included in the verification email. */
    @GetMapping("/verificar")
    public ResponseEntity<RespuestaMensaje> verificarCorreo(@RequestParam String token) {
        return ResponseEntity.ok(servicioRegistro.verificarCorreo(token));
    }

    @PostMapping("/login")
    public ResponseEntity<RespuestaAutenticacion> iniciarSesion(@Valid @RequestBody SolicitudLogin solicitud) {
        return ResponseEntity.ok(servicioAutenticacion.iniciarSesion(solicitud));
    }

    @PostMapping("/logout")
    public ResponseEntity<RespuestaMensaje> cerrarSesion(
            @org.springframework.web.bind.annotation.RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            servicioAutenticacion.cerrarSesion(authorizationHeader.substring(7));
        }
        return ResponseEntity.ok(new RespuestaMensaje("Sesión finalizada exitosamente."));
    }
}
