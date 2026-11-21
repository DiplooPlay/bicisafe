package pe.edu.untels.bicisafe.ruta;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import pe.edu.untels.bicisafe.auth.domain.RolUsuario;
import pe.edu.untels.bicisafe.auth.dto.RespuestaMensaje;
import pe.edu.untels.bicisafe.config.security.UsuarioAutenticado;
import pe.edu.untels.bicisafe.ruta.controller.RutaGuardadaControlador;
import pe.edu.untels.bicisafe.ruta.dto.GuardarRutaRequest;
import pe.edu.untels.bicisafe.ruta.dto.RutaGuardadaResponse;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutaGuardada;

import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RutaGuardadaControladorTest {

    private final ServicioRutaGuardada servicioRutaGuardada = mock(ServicioRutaGuardada.class);
    private final RutaGuardadaControlador controlador = new RutaGuardadaControlador(servicioRutaGuardada);

    @Test
    @DisplayName("guardar ruta frecuente devuelve la ruta guardada (HU-16)")
    void shouldSaveFrequentRoute() {
        UUID usuarioId = UUID.randomUUID();
        UsuarioAutenticado usuario = new UsuarioAutenticado(usuarioId, "user@test.com", RolUsuario.CICLISTA);
        GuardarRutaRequest request = new GuardarRutaRequest(
                "Mi ruta", "Origen", "Destino", -12.1, -77.0, -12.2, -77.0, 3.5, 15, List.of()
        );
        RutaGuardadaResponse mockResponse = new RutaGuardadaResponse(
                UUID.randomUUID(), "Mi ruta", "Origen", "Destino", -12.1, -77.0, -12.2, -77.0, 3.5, 15, List.of(), null
        );

        when(servicioRutaGuardada.guardarRuta(usuarioId, request)).thenReturn(mockResponse);

        RutaGuardadaResponse response = controlador.guardarRuta(request, usuario);

        assertThat(response.nombre()).isEqualTo("Mi ruta");
        verify(servicioRutaGuardada).guardarRuta(usuarioId, request);
    }

    @Test
    @DisplayName("eliminar ruta guardada devuelve confirmación (HU-16)")
    void shouldDeleteSavedRoute() {
        UUID usuarioId = UUID.randomUUID();
        UUID rutaId = UUID.randomUUID();
        UsuarioAutenticado usuario = new UsuarioAutenticado(usuarioId, "user@test.com", RolUsuario.CICLISTA);

        RespuestaMensaje respuesta = controlador.eliminarRuta(rutaId, usuario);

        assertThat(respuesta.mensaje()).contains("eliminada");
        verify(servicioRutaGuardada).eliminarRuta(rutaId, usuarioId);
    }

    @Test
    @DisplayName("rechazar acceso cuando no hay usuario autenticado (401/403)")
    void shouldRejectAccessWhenUserIsNull() {
        GuardarRutaRequest request = new GuardarRutaRequest(
                "Mi ruta", "Origen", "Destino", -12.1, -77.0, -12.2, -77.0, 3.5, 15, List.of()
        );

        assertThatThrownBy(() -> controlador.guardarRuta(request, null))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("iniciar sesión");

        assertThatThrownBy(() -> controlador.listarRutas(null))
                .isInstanceOf(AccessDeniedException.class);
    }
}
