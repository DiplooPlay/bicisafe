package pe.edu.untels.bicisafe.incidente.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.incidente.domain.CategoriaIncidente;
import pe.edu.untels.bicisafe.incidente.domain.EstadoIncidente;
import pe.edu.untels.bicisafe.incidente.domain.Incidente;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteRequest;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteRepository;

/**
 * Service implementation for road incidents and decentralized consensus.
 */
@Service
@Transactional
public class IncidenteServiceImpl implements IncidenteService {

    private final IncidenteRepository incidenteRepository;

    public IncidenteServiceImpl(IncidenteRepository incidenteRepository) {
        this.incidenteRepository = incidenteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incidente> listarActivos() {
        return incidenteRepository.findByEstadoNotAndFechaExpiracionAfterOrderByFechaCreacionDesc(
                EstadoIncidente.RESUELTO,
                Instant.now()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incidente> listarTodos() {
        return incidenteRepository.findAllByOrderByFechaCreacionDesc();
    }

    @Override
    public Incidente reportarIncidente(IncidenteRequest solicitud, String nombreAutor) {
        Incidente entidad = new Incidente();
        entidad.setCategoria(CategoriaIncidente.fromString(solicitud.categoria()));
        entidad.setTitulo(solicitud.titulo());
        entidad.setDescripcion(solicitud.descripcion());
        entidad.setUbicacionTexto(solicitud.ubicacionTexto());
        entidad.setLatitud(solicitud.latitud());
        entidad.setLongitud(solicitud.longitud());
        entidad.setFotoUrl(solicitud.fotoUrl());
        entidad.setAutorNombre(nombreAutor != null && !nombreAutor.isBlank() ? nombreAutor : "Ciclista Urbano");
        entidad.setAutorReputacion(16);
        entidad.setEstado(EstadoIncidente.PENDIENTE);
        entidad.setVotosConfirmar(1);
        entidad.setVotosRechazar(0);
        entidad.setVotosRequeridos(3);
        entidad.setFechaCreacion(Instant.now());
        entidad.setFechaExpiracion(Instant.now().plus(2, ChronoUnit.HOURS));

        return incidenteRepository.save(entidad);
    }

    @Override
    public Incidente confirmarIncidente(UUID id) {
        Incidente entidad = incidenteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Incidente no encontrado con id: " + id));

        entidad.registrarConfirmacion();
        return incidenteRepository.save(entidad);
    }

    @Override
    public Incidente resolverIncidente(UUID id) {
        Incidente entidad = incidenteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Incidente no encontrado con id: " + id));

        entidad.marcarComoResuelto();
        return incidenteRepository.save(entidad);
    }
}
