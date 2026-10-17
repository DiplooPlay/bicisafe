package pe.edu.untels.bicisafe.incidente;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.incidente.domain.CategoriaIncidente;
import pe.edu.untels.bicisafe.incidente.domain.EstadoIncidente;
import pe.edu.untels.bicisafe.incidente.domain.Incidente;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteRequest;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteRepository;
import pe.edu.untels.bicisafe.incidente.service.IncidenteService;
import pe.edu.untels.bicisafe.incidente.service.IncidenteServiceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for incident management and consensus voting.
 */
class IncidenteServiceTest {

    private IncidenteRepository incidenteRepository;
    private IncidenteService incidenteService;

    @BeforeEach
    void setUp() {
        incidenteRepository = mock(IncidenteRepository.class);
        incidenteService = new IncidenteServiceImpl(incidenteRepository);
    }

    @Test
    @DisplayName("crear incidente en estado PENDIENTE con un voto inicial del autor")
    void shouldCreatePendingIncidentWhenReported() {
        IncidenteRequest request = new IncidenteRequest(
                "bache",
                "Bache severo en ciclovía",
                "Profundidad de 10 cm con agua estancada",
                "Av. Arequipa cdra 34",
                -12.1050,
                -77.0315,
                null
        );

        when(incidenteRepository.save(any(Incidente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incidente resultado = incidenteService.reportarIncidente(request, "Carlos Ciclista");

        assertThat(resultado.getCategoria()).isEqualTo(CategoriaIncidente.BACHE);
        assertThat(resultado.getTitulo()).isEqualTo("Bache severo en ciclovía");
        assertThat(resultado.getEstado()).isEqualTo(EstadoIncidente.PENDIENTE);
        assertThat(resultado.getVotosConfirmar()).isEqualTo(1);
        assertThat(resultado.getVotosRechazar()).isEqualTo(0);
        assertThat(resultado.getAutorNombre()).isEqualTo("Carlos Ciclista");
    }

    @Test
    @DisplayName("avanzar a CONFIRMADO cuando las confirmaciones alcanzan el umbral")
    void shouldAdvanceToConfirmedWhenVotesReachThreshold() {
        UUID id = UUID.randomUUID();
        Incidente existente = new Incidente();
        existente.setId(id);
        existente.setVotosConfirmar(2);
        existente.setVotosRequeridos(3);
        existente.setEstado(EstadoIncidente.PENDIENTE);

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(existente));
        when(incidenteRepository.save(any(Incidente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incidente resultado = incidenteService.confirmarIncidente(id);

        assertThat(resultado.getVotosConfirmar()).isEqualTo(3);
        assertThat(resultado.getEstado()).isEqualTo(EstadoIncidente.CONFIRMADO);
    }

    @Test
    @DisplayName("marcar incidente como RESUELTO cuando se solicita retirarlo")
    void shouldMarkIncidentAsResolvedWhenRequested() {
        UUID id = UUID.randomUUID();
        Incidente existente = new Incidente();
        existente.setId(id);
        existente.setEstado(EstadoIncidente.CONFIRMADO);

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(existente));
        when(incidenteRepository.save(any(Incidente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incidente resultado = incidenteService.resolverIncidente(id);

        assertThat(resultado.getEstado()).isEqualTo(EstadoIncidente.RESUELTO);
        assertThat(resultado.getVotosRechazar()).isEqualTo(1);
    }

    @Test
    @DisplayName("lanzar RecursoNoEncontradoExcepcion cuando el incidente no existe")
    void shouldThrowNotFoundExceptionWhenIncidentDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(incidenteRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidenteService.confirmarIncidente(id))
                .isInstanceOf(RecursoNoEncontradoExcepcion.class)
                .hasMessageContaining(id.toString());
    }
}
