package pe.edu.untels.bicisafe.auth;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import pe.edu.untels.bicisafe.auth.controller.UsuarioControlador;
import pe.edu.untels.bicisafe.auth.domain.RolUsuario;
import pe.edu.untels.bicisafe.auth.dto.PerfilUsuarioResponse;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.config.security.UsuarioAutenticado;
import pe.edu.untels.bicisafe.incidente.service.IncidenteService;

import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UsuarioControladorTest {

    private final ServicioRegistro servicioRegistro = mock(ServicioRegistro.class);
    private final IncidenteService incidenteService = mock(IncidenteService.class);
    private final UsuarioControlador controlador = new UsuarioControlador(servicioRegistro, incidenteService);

    @Test
    @DisplayName("consultar perfil del ciclista con reputación e historial (HU-04)")
    void shouldReturnCyclistProfileAndHistory() {
        UUID usuarioId = UUID.randomUUID();
        UsuarioAutenticado usuarioAutenticado = new UsuarioAutenticado(usuarioId, "carlos@correo.com", RolUsuario.CICLISTA);

        when(servicioRegistro.obtenerPorId(usuarioId)).thenReturn(
                new RespuestaUsuario(usuarioId, "carlos@correo.com", "Carlos", "CICLISTA", "ACTIVO", 24)
        );
        when(incidenteService.listarPorUsuario(usuarioId)).thenReturn(List.of());
        when(incidenteService.contarPorUsuario(usuarioId)).thenReturn(3L);

        PerfilUsuarioResponse perfil = controlador.perfil(usuarioAutenticado);

        assertThat(perfil.id()).isEqualTo(usuarioId);
        assertThat(perfil.reputacion()).isEqualTo(24);
        assertThat(perfil.totalReportes()).isEqualTo(3L);
        assertThat(perfil.historialReportes()).isEmpty();
    }

    @Test
    @DisplayName("eliminar la cuenta del ciclista autenticado (RNF-10)")
    void shouldDeleteAccountSuccessfully() {
        UUID usuarioId = UUID.randomUUID();
        UsuarioAutenticado usuarioAutenticado = new UsuarioAutenticado(usuarioId, "carlos@correo.com", RolUsuario.CICLISTA);

        RespuestaMensaje respuesta = controlador.eliminarCuenta(usuarioAutenticado);

        assertThat(respuesta.mensaje()).contains("eliminada");
        verify(servicioRegistro).eliminarCuenta(usuarioId);
    }

    @Test
    @DisplayName("rechazar acceso sin autenticación en endpoints de usuario")
    void shouldRejectAccessWhenUserIsNull() {
        assertThatThrownBy(() -> controlador.me(null))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> controlador.perfil(null))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> controlador.eliminarCuenta(null))
                .isInstanceOf(AccessDeniedException.class);
    }
}
