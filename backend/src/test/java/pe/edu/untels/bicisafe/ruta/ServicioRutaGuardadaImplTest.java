package pe.edu.untels.bicisafe.ruta;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.compartido.excepcion.EntradaInvalidaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.ruta.domain.RutaGuardada;
import pe.edu.untels.bicisafe.ruta.dto.GuardarRutaRequest;
import pe.edu.untels.bicisafe.ruta.dto.RutaGuardadaResponse;
import pe.edu.untels.bicisafe.ruta.dto.UsuarioRutaAfectada;
import pe.edu.untels.bicisafe.ruta.repository.RutaGuardadaRepository;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutaGuardadaImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ServicioRutaGuardadaImplTest {

    private RutaGuardadaRepository repository;
    private ServicioRegistro servicioRegistro;
    private ServicioRutaGuardadaImpl servicio;

    @BeforeEach
    void setUp() {
        repository = mock(RutaGuardadaRepository.class);
        servicioRegistro = mock(ServicioRegistro.class);
        servicio = new ServicioRutaGuardadaImpl(repository, servicioRegistro);
    }

    @Test
    @DisplayName("guardar una ruta frecuente con nombre válido (HU-16)")
    void shouldSaveFrequentRouteSuccessfully() {
        UUID usuarioId = UUID.randomUUID();
        GuardarRutaRequest request = new GuardarRutaRequest(
                "Mi ruta diaria",
                "Miraflores",
                "San Isidro",
                -12.12, -77.03,
                -12.10, -77.03,
                2.5, 12,
                List.of(new double[] { -12.12, -77.03 }, new double[] { -12.10, -77.03 })
        );

        when(repository.save(any(RutaGuardada.class))).thenAnswer(invocation -> {
            RutaGuardada rg = invocation.getArgument(0);
            rg.setId(UUID.randomUUID());
            return rg;
        });

        RutaGuardadaResponse response = servicio.guardarRuta(usuarioId, request);

        assertThat(response.nombre()).isEqualTo("Mi ruta diaria");
        assertThat(response.puntos()).hasSize(2);
        verify(repository).save(any(RutaGuardada.class));
    }

    @Test
    @DisplayName("rechazar guardar ruta con nombre vacío (HU-16)")
    void shouldRejectSavingRouteWithEmptyName() {
        UUID usuarioId = UUID.randomUUID();
        GuardarRutaRequest request = new GuardarRutaRequest(
                "   ",
                "Origen", "Destino",
                -12.12, -77.03, -12.10, -77.03,
                2.0, 10,
                List.of(new double[] { -12.12, -77.03 })
        );

        assertThatThrownBy(() -> servicio.guardarRuta(usuarioId, request))
                .isInstanceOf(EntradaInvalidaExcepcion.class)
                .hasMessageContaining("vacío");
    }

    @Test
    @DisplayName("consultar ruta guardada por ID sin recalcular (HU-16)")
    void shouldRetrieveSavedRouteByIdWithoutRecalculating() {
        UUID usuarioId = UUID.randomUUID();
        UUID rutaId = UUID.randomUUID();
        RutaGuardada ruta = new RutaGuardada();
        ruta.setId(rutaId);
        ruta.setUsuarioId(usuarioId);
        ruta.setNombre("Casa a Universidad");
        ruta.setGeometriaJson("[[-12.12,-77.03],[-12.10,-77.03]]");

        when(repository.findByIdAndUsuarioId(rutaId, usuarioId)).thenReturn(Optional.of(ruta));

        RutaGuardadaResponse response = servicio.obtenerRuta(rutaId, usuarioId);

        assertThat(response.id()).isEqualTo(rutaId);
        assertThat(response.nombre()).isEqualTo("Casa a Universidad");
        assertThat(response.puntos()).hasSize(2);
    }

    @Test
    @DisplayName("eliminar ruta guardada (HU-16)")
    void shouldDeleteSavedRoute() {
        UUID usuarioId = UUID.randomUUID();
        UUID rutaId = UUID.randomUUID();
        RutaGuardada ruta = new RutaGuardada();
        ruta.setId(rutaId);
        ruta.setUsuarioId(usuarioId);

        when(repository.findByIdAndUsuarioId(rutaId, usuarioId)).thenReturn(Optional.of(ruta));

        servicio.eliminarRuta(rutaId, usuarioId);

        verify(repository).delete(ruta);
    }

    @Test
    @DisplayName("lanzar RecursoNoEncontradoExcepcion al eliminar ruta inexistente")
    void shouldThrowNotFoundWhenDeletingNonExistentRoute() {
        UUID usuarioId = UUID.randomUUID();
        UUID rutaId = UUID.randomUUID();
        when(repository.findByIdAndUsuarioId(rutaId, usuarioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.eliminarRuta(rutaId, usuarioId))
                .isInstanceOf(RecursoNoEncontradoExcepcion.class);
    }

    @Test
    @DisplayName("buscar usuarios con ruta cercana a coordenadas (HU-17)")
    void shouldFindUsersWithNearbySavedRoute() {
        UUID usuarioId = UUID.randomUUID();
        RutaGuardada ruta = new RutaGuardada();
        ruta.setId(UUID.randomUUID());
        ruta.setUsuarioId(usuarioId);
        ruta.setNombre("Ruta Trabajo");
        ruta.setGeometriaJson("[[-12.1200,-77.0300],[-12.1100,-77.0300]]");

        when(repository.findAll()).thenReturn(List.of(ruta));
        when(servicioRegistro.obtenerPorId(usuarioId)).thenReturn(
                new RespuestaUsuario(usuarioId, "carlos@correo.com", "Carlos", "CICLISTA", "ACTIVO", 15)
        );

        // Incident location is very close to point 1 (-12.1201, -77.0301)
        List<UsuarioRutaAfectada> afectados = servicio.buscarUsuariosConRutaCercana(-12.1201, -77.0301, 300.0);

        assertThat(afectados).hasSize(1);
        assertThat(afectados.get(0).correo()).isEqualTo("carlos@correo.com");
        assertThat(afectados.get(0).nombreRuta()).isEqualTo("Ruta Trabajo");
    }
}
