package pe.edu.untels.bicisafe.incidente.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.untels.bicisafe.auth.service.ServicioCorreo;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.compartido.excepcion.EntradaInvalidaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.ValorDuplicadoExcepcion;
import pe.edu.untels.bicisafe.incidente.domain.CategoriaIncidente;
import pe.edu.untels.bicisafe.incidente.domain.EstadoIncidente;
import pe.edu.untels.bicisafe.incidente.domain.Incidente;
import pe.edu.untels.bicisafe.incidente.domain.IncidenteDenuncia;
import pe.edu.untels.bicisafe.incidente.domain.IncidenteVoto;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteRequest;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteDenunciaRepository;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteRepository;
import pe.edu.untels.bicisafe.incidente.repository.IncidenteVotoRepository;
import pe.edu.untels.bicisafe.ruta.dto.UsuarioRutaAfectada;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutaGuardada;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutaGuardadaImpl;

/**
 * Service implementation for road incidents and decentralized consensus.
 */
@Service
@Transactional
public class IncidenteServiceImpl implements IncidenteService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IncidenteServiceImpl.class);

    private final IncidenteRepository incidenteRepository;
    private final IncidenteDenunciaRepository denunciaRepository;
    private final IncidenteVotoRepository incidenteVotoRepository;
    private final ServicioRegistro servicioRegistro;
    private final ServicioCorreo servicioCorreo;
    private final ServicioRutaGuardada servicioRutaGuardada;

    public IncidenteServiceImpl(
            IncidenteRepository incidenteRepository,
            IncidenteDenunciaRepository denunciaRepository,
            IncidenteVotoRepository incidenteVotoRepository,
            ServicioRegistro servicioRegistro,
            ServicioCorreo servicioCorreo,
            ServicioRutaGuardada servicioRutaGuardada) {
        this.incidenteRepository = incidenteRepository;
        this.denunciaRepository = denunciaRepository;
        this.incidenteVotoRepository = incidenteVotoRepository;
        this.servicioRegistro = servicioRegistro;
        this.servicioCorreo = servicioCorreo;
        this.servicioRutaGuardada = servicioRutaGuardada;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incidente> listarActivos() {
        return incidenteRepository.findAll().stream()
                .filter(Incidente::estaActivo)
                .sorted((a, b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incidente> listarTodos() {
        return incidenteRepository.findAllByOrderByFechaCreacionDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incidente> listarPorUsuario(UUID usuarioId) {
        return incidenteRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPorUsuario(UUID usuarioId) {
        return incidenteRepository.countByUsuarioId(usuarioId);
    }

    @Override
    public Incidente reportarIncidente(IncidenteRequest solicitud, String nombreAutor) {
        return reportarIncidente(solicitud, nombreAutor, null);
    }

    @Override
    public Incidente reportarIncidente(IncidenteRequest solicitud, String nombreAutor, UUID usuarioId) {
        Incidente entidad = new Incidente();
        entidad.setCategoria(CategoriaIncidente.fromString(solicitud.categoria()));
        entidad.setTitulo(solicitud.titulo());
        entidad.setDescripcion(solicitud.descripcion());
        entidad.setUbicacionTexto(solicitud.ubicacionTexto());
        entidad.setLatitud(solicitud.latitud());
        entidad.setLongitud(solicitud.longitud());
        entidad.setFotoUrl(solicitud.fotoUrl());
        entidad.setUsuarioId(usuarioId);
        entidad.setAutorNombre(nombreAutor != null && !nombreAutor.isBlank() ? nombreAutor : "Ciclista Urbano");

        int reputacion = 15;
        if (usuarioId != null) {
            try {
                var u = servicioRegistro.obtenerPorId(usuarioId);
                if (u != null) {
                    reputacion = u.reputacion();
                }
            } catch (Exception ignored) {
            }
        }
        entidad.setAutorReputacion(reputacion);
        entidad.setEstado(EstadoIncidente.PENDIENTE);
        entidad.setVotosConfirmar(1);
        entidad.setVotosRechazar(0);
        entidad.setVotosRequeridos(3);
        entidad.setFechaCreacion(Instant.now());
        entidad.setFechaExpiracion(Instant.now().plus(2, ChronoUnit.HOURS));

        Incidente guardado = incidenteRepository.save(entidad);

        if (usuarioId != null) {
            servicioRegistro.sumarReputacion(usuarioId, 2);
            IncidenteVoto votoInicial = new IncidenteVoto(
                    UUID.randomUUID(),
                    guardado.getId(),
                    usuarioId,
                    usuarioId.toString(),
                    "CONFIRMAR",
                    Instant.now()
            );
            incidenteVotoRepository.save(votoInicial);
        }

        return guardado;
    }

    @Override
    public Incidente confirmarIncidente(UUID id) {
        return confirmarIncidente(id, null);
    }

    @Override
    public Incidente confirmarIncidente(UUID id, UUID usuarioId) {
        Incidente entidad = incidenteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Incidente no encontrado con id: " + id));

        if (usuarioId != null) {
            if (incidenteVotoRepository.existsByIncidenteIdAndUsuarioId(id, usuarioId)) {
                throw new ValorDuplicadoExcepcion("usuarioId", "Ya has votado en este reporte.");
            }
            IncidenteVoto voto = new IncidenteVoto(
                    UUID.randomUUID(),
                    id,
                    usuarioId,
                    usuarioId.toString(),
                    "CONFIRMAR",
                    Instant.now()
            );
            incidenteVotoRepository.save(voto);
        }

        boolean estabaConfirmado = entidad.getEstado() == EstadoIncidente.CONFIRMADO;
        entidad.registrarConfirmacion();
        Incidente guardado = incidenteRepository.save(entidad);

        // HU-17: When confirmed by community consensus, notify cyclists with saved routes nearby
        if (!estabaConfirmado && guardado.getEstado() == EstadoIncidente.CONFIRMADO) {
            if (guardado.getUsuarioId() != null) {
                servicioRegistro.sumarReputacion(guardado.getUsuarioId(), 5);
            }

            if (guardado.getLatitud() != null && guardado.getLongitud() != null) {
                try {
                    List<UsuarioRutaAfectada> afectados = servicioRutaGuardada.buscarUsuariosConRutaCercana(
                            guardado.getLatitud(), guardado.getLongitud(), 500.0);

                    for (UsuarioRutaAfectada afectado : afectados) {
                        servicioCorreo.enviarAlertaIncidenteEnRuta(
                                afectado.correo(),
                                afectado.nombre(),
                                afectado.nombreRuta(),
                                guardado.getCategoria().name(),
                                guardado.getUbicacionTexto());
                    }
                } catch (Exception e) {
                    LOGGER.warn("Error enviando alertas de ruta para incidente {}: {}", id, e.getMessage());
                }
            }
        }

        return guardado;
    }

    @Override
    public Incidente resolverIncidente(UUID id) {
        return resolverIncidente(id, null);
    }

    @Override
    public Incidente resolverIncidente(UUID id, UUID usuarioId) {
        Incidente entidad = incidenteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Incidente no encontrado con id: " + id));

        if (usuarioId != null) {
            if (incidenteVotoRepository.existsByIncidenteIdAndUsuarioId(id, usuarioId)) {
                throw new ValorDuplicadoExcepcion("usuarioId", "Ya has votado en este reporte.");
            }
            IncidenteVoto voto = new IncidenteVoto(
                    UUID.randomUUID(),
                    id,
                    usuarioId,
                    usuarioId.toString(),
                    "RESOLVER",
                    Instant.now()
            );
            incidenteVotoRepository.save(voto);
        }

        entidad.marcarComoResuelto();
        return incidenteRepository.save(entidad);
    }

    @Override
    public Incidente denunciarIncidente(UUID id, UUID usuarioId, String motivo, String comentario) {
        Incidente entidad = incidenteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Incidente no encontrado con id: " + id));

        if (usuarioId != null && denunciaRepository.existsByIncidenteIdAndUsuarioId(id, usuarioId)) {
            throw new EntradaInvalidaExcepcion("Ya has enviado un reporte para este incidente.");
        }

        IncidenteDenuncia denuncia = new IncidenteDenuncia();
        denuncia.setIncidenteId(id);
        denuncia.setUsuarioId(usuarioId);
        denuncia.setMotivo(motivo != null ? motivo.trim().toUpperCase() : "OTRO");
        denuncia.setComentario(comentario);
        denuncia.setFechaCreacion(Instant.now());
        denunciaRepository.save(denuncia);

        entidad.registrarDenuncia(motivo);
        Incidente guardado = incidenteRepository.save(entidad);

        if (guardado.getEstado() == EstadoIncidente.INVALIDO && guardado.getUsuarioId() != null) {
            servicioRegistro.sumarReputacion(guardado.getUsuarioId(), -5);
        }

        return guardado;
    }

    @Override
    @Scheduled(fixedRate = 60000)
    public void expirarIncidentesVencidos() {
        Instant ahora = Instant.now();
        List<Incidente> activos = incidenteRepository.findAll().stream()
                .filter(i -> i.getEstado() != EstadoIncidente.RESUELTO
                        && i.getEstado() != EstadoIncidente.INVALIDO
                        && i.getEstado() != EstadoIncidente.EXPIRADO)
                .filter(i -> i.getFechaExpiracion() != null && ahora.isAfter(i.getFechaExpiracion()))
                .toList();

        for (Incidente i : activos) {
            i.marcarComoExpirado();
            incidenteRepository.save(i);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Incidente> listarIncidentesCercanosARuta(List<double[]> puntos, double radioMetros) {
        List<Incidente> activos = listarActivos();
        if (puntos == null || puntos.isEmpty()) {
            return activos;
        }

        return activos.stream()
                .filter(inc -> ServicioRutaGuardadaImpl.calcularDistanciaMinimaMetros(
                        inc.getLatitud(), inc.getLongitud(), puntos) <= radioMetros)
                .toList();
    }
}
