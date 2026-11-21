package pe.edu.untels.bicisafe.incidente;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import pe.edu.untels.bicisafe.auth.service.ServicioCorreo;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.compartido.excepcion.EntradaInvalidaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.incidente.domain.CategoriaIncidente;
import pe.edu.untels.bicisafe.incidente.domain.EstadoIncidente;
import pe.edu.untels.bicisafe.incidente.domain.Incidente;
import pe.edu.untels.bicisafe.incidente.domain.IncidenteDenuncia;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteRequest;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteDenunciaRepository;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteRepository;
import pe.edu.untels.bicisafe.incidente.service.IncidenteService;
import pe.edu.untels.bicisafe.incidente.service.IncidenteServiceImpl;
import pe.edu.untels.bicisafe.ruta.dto.UsuarioRutaAfectada;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutaGuardada;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for incident management, consensus voting, moderation, and alerts.
 */
class IncidenteServiceTest {

    private IncidenteRepository incidenteRepository;
    private IncidenteDenunciaRepository denunciaRepository;
    private ServicioRegistro servicioRegistro;
    private ServicioCorreo servicioCorreo;
    private ServicioRutaGuardada servicioRutaGuardada;
    private IncidenteService incidenteService;

    @BeforeEach
    void setUp() {
        incidenteRepository = mock(IncidenteRepository.class);
        denunciaRepository = mock(IncidenteDenunciaRepository.class);
        servicioRegistro = mock(ServicioRegistro.class);
        servicioCorreo = mock(ServicioCorreo.class);
        servicioRutaGuardada = mock(ServicioRutaGuardada.class);
        incidenteService = new IncidenteServiceImpl(
                incidenteRepository,
                denunciaRepository,
                servicioRegistro,
                servicioCorreo,
                servicioRutaGuardada);
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

    @Test
    @DisplayName("al confirmar incidente se envían alertas por correo a usuarios con rutas cercanas (HU-17)")
    void shouldSendEmailAlertsToAffectedCyclistsWhenConfirmed() {
        UUID id = UUID.randomUUID();
        Incidente existente = new Incidente();
        existente.setId(id);
        existente.setCategoria(CategoriaIncidente.OBRAS);
        existente.setUbicacionTexto("Av. Arequipa cdra 20");
        existente.setLatitud(-12.0850);
        existente.setLongitud(-77.0340);
        existente.setVotosConfirmar(2);
        existente.setVotosRequeridos(3);
        existente.setEstado(EstadoIncidente.PENDIENTE);

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(existente));
        when(incidenteRepository.save(any(Incidente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UUID ciclistaAfectado = UUID.randomUUID();
        when(servicioRutaGuardada.buscarUsuariosConRutaCercana(-12.0850, -77.0340, 500.0)).thenReturn(List.of(
                new UsuarioRutaAfectada(ciclistaAfectado, "juan@correo.com", "Juan", "Casa al Trabajo")
        ));

        incidenteService.confirmarIncidente(id);

        verify(servicioCorreo).enviarAlertaIncidenteEnRuta(
                eq("juan@correo.com"),
                eq("Juan"),
                eq("Casa al Trabajo"),
                eq("OBRAS"),
                eq("Av. Arequipa cdra 20"));
    }

    @Test
    @DisplayName("denunciar incidente inapropiado como falso o duplicado (HU-14)")
    void shouldReportInappropriateIncident() {
        UUID id = UUID.randomUUID();
        Incidente existente = new Incidente();
        existente.setId(id);
        existente.setEstado(EstadoIncidente.PENDIENTE);

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(existente));
        when(incidenteRepository.save(any(Incidente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UUID usuarioId = UUID.randomUUID();
        Incidente resultado = incidenteService.denunciarIncidente(id, usuarioId, "DUPLICADO", "Mismo reporte que otro");

        assertThat(resultado.getDenunciasDuplicado()).isEqualTo(1);
        assertThat(resultado.getEstado()).isEqualTo(EstadoIncidente.EN_DISPUTA);
        verify(denunciaRepository).save(any(IncidenteDenuncia.class));
    }

    @Test
    @DisplayName("expirar incidentes vencidos automáticamente (HU-15)")
    void shouldExpireOutdatedIncidentsAutomatically() {
        Incidente vencido = new Incidente();
        vencido.setId(UUID.randomUUID());
        vencido.setEstado(EstadoIncidente.PENDIENTE);
        vencido.setFechaExpiracion(Instant.now().minus(10, ChronoUnit.MINUTES));

        Incidente vigente = new Incidente();
        vigente.setId(UUID.randomUUID());
        vigente.setEstado(EstadoIncidente.PENDIENTE);
        vigente.setFechaExpiracion(Instant.now().plus(2, ChronoUnit.HOURS));

        when(incidenteRepository.findAll()).thenReturn(List.of(vencido, vigente));

        incidenteService.expirarIncidentesVencidos();

        assertThat(vencido.getEstado()).isEqualTo(EstadoIncidente.EXPIRADO);
        assertThat(vigente.getEstado()).isEqualTo(EstadoIncidente.PENDIENTE);
        verify(incidenteRepository).save(vencido);
        verify(incidenteRepository, never()).save(vigente);
    }

    @Test
    @DisplayName("listar incidentes cercanos a una ruta (HU-09)")
    void shouldFilterIncidentsNearRoute() {
        Incidente cercano = new Incidente();
        cercano.setId(UUID.randomUUID());
        cercano.setEstado(EstadoIncidente.PENDIENTE);
        cercano.setLatitud(-12.1200);
        cercano.setLongitud(-77.0300);
        cercano.setFechaCreacion(Instant.now());
        cercano.setFechaExpiracion(Instant.now().plus(2, ChronoUnit.HOURS));

        Incidente lejano = new Incidente();
        lejano.setId(UUID.randomUUID());
        lejano.setEstado(EstadoIncidente.PENDIENTE);
        lejano.setLatitud(-11.9500); // Far away in north Lima
        lejano.setLongitud(-77.0600);
        lejano.setFechaCreacion(Instant.now());
        lejano.setFechaExpiracion(Instant.now().plus(2, ChronoUnit.HOURS));

        when(incidenteRepository.findAll()).thenReturn(List.of(cercano, lejano));

        List<double[]> rutaPuntos = List.of(
                new double[] { -12.1195, -77.0295 },
                new double[] { -12.1210, -77.0305 }
        );

        List<Incidente> resultado = incidenteService.listarIncidentesCercanosARuta(rutaPuntos, 200.0);

        assertThat(resultado).containsExactly(cercano);
    }

    @Test
    @DisplayName("no permitir que el mismo ciclista denuncie dos veces el mismo incidente (HU-14)")
    void shouldRejectDuplicateDenunciaFromSameCyclist() {
        UUID id = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        Incidente existente = new Incidente();
        existente.setId(id);

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(existente));
        when(denunciaRepository.existsByIncidenteIdAndUsuarioId(id, usuarioId)).thenReturn(true);

        assertThatThrownBy(() -> incidenteService.denunciarIncidente(id, usuarioId, "FALSO", "Duplicado"))
                .isInstanceOf(EntradaInvalidaExcepcion.class)
                .hasMessageContaining("Ya has enviado un reporte");
    }

    @Test
    @DisplayName("penalizar reputación del autor cuando el incidente alcanza 3 denuncias de falso (HU-14)")
    void shouldPenalizeAuthorReputationWhenIncidentResolvedByFalseReports() {
        UUID id = UUID.randomUUID();
        UUID autorId = UUID.randomUUID();
        UUID denunciante = UUID.randomUUID();

        Incidente incidente = new Incidente();
        incidente.setId(id);
        incidente.setUsuarioId(autorId);
        incidente.setDenunciasFalso(2); // One more will reach 3

        when(incidenteRepository.findById(id)).thenReturn(Optional.of(incidente));
        when(denunciaRepository.existsByIncidenteIdAndUsuarioId(id, denunciante)).thenReturn(false);
        when(incidenteRepository.save(any(Incidente.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incidente resultado = incidenteService.denunciarIncidente(id, denunciante, "FALSO", "Es mentira");

        assertThat(resultado.getEstado()).isEqualTo(EstadoIncidente.RESUELTO);
        verify(servicioRegistro).sumarReputacion(autorId, -5);
    }

    @Test
    @DisplayName("ignorar incidentes con fecha de expiración nula sin lanzar excepción (HU-15)")
    void shouldHandleNullExpirationDateGracefully() {
        Incidente sinFecha = new Incidente();
        sinFecha.setId(UUID.randomUUID());
        sinFecha.setEstado(EstadoIncidente.PENDIENTE);
        sinFecha.setFechaExpiracion(null);

        when(incidenteRepository.findAll()).thenReturn(List.of(sinFecha));

        incidenteService.expirarIncidentesVencidos();

        assertThat(sinFecha.getEstado()).isEqualTo(EstadoIncidente.PENDIENTE);
        verify(incidenteRepository, never()).save(sinFecha);
    }
}
