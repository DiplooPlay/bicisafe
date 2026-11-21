package pe.edu.untels.bicisafe.ruta.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import pe.edu.untels.bicisafe.auth.dto.RespuestaUsuario;
import pe.edu.untels.bicisafe.auth.service.ServicioRegistro;
import pe.edu.untels.bicisafe.compartido.excepcion.EntradaInvalidaExcepcion;
import pe.edu.untels.bicisafe.compartido.excepcion.RecursoNoEncontradoExcepcion;
import pe.edu.untels.bicisafe.integracion.ors.OrsAdapter;
import pe.edu.untels.bicisafe.ruta.domain.RutaGuardada;
import pe.edu.untels.bicisafe.ruta.dto.GuardarRutaRequest;
import pe.edu.untels.bicisafe.ruta.dto.RutaGuardadaResponse;
import pe.edu.untels.bicisafe.ruta.dto.UsuarioRutaAfectada;
import pe.edu.untels.bicisafe.ruta.repository.RutaGuardadaRepository;

/**
 * Service implementation for cyclist saved routes (HU-16) and proximity queries (HU-17).
 */
@Service
@Transactional
public class ServicioRutaGuardadaImpl implements ServicioRutaGuardada {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServicioRutaGuardadaImpl.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final RutaGuardadaRepository rutaGuardadaRepository;
    private final ServicioRegistro servicioRegistro;

    public ServicioRutaGuardadaImpl(
            RutaGuardadaRepository rutaGuardadaRepository,
            ServicioRegistro servicioRegistro) {
        this.rutaGuardadaRepository = rutaGuardadaRepository;
        this.servicioRegistro = servicioRegistro;
    }

    @Override
    public RutaGuardadaResponse guardarRuta(UUID usuarioId, GuardarRutaRequest solicitud) {
        if (solicitud.nombre() == null || solicitud.nombre().trim().isEmpty()) {
            throw new EntradaInvalidaExcepcion("El nombre de la ruta no puede estar vacío.");
        }

        String geometriaJson;
        try {
            geometriaJson = OBJECT_MAPPER.writeValueAsString(solicitud.puntos());
        } catch (Exception e) {
            LOGGER.error("Error serializando geometría de ruta: {}", e.getMessage());
            throw new EntradaInvalidaExcepcion("Formato de puntos inválido.");
        }

        RutaGuardada entidad = new RutaGuardada();
        entidad.setUsuarioId(usuarioId);
        entidad.setNombre(solicitud.nombre().trim());
        entidad.setOrigenNombre(solicitud.origenNombre() != null ? solicitud.origenNombre() : "Origen");
        entidad.setDestinoNombre(solicitud.destinoNombre() != null ? solicitud.destinoNombre() : "Destino");
        entidad.setLatOrigen(solicitud.latOrigen());
        entidad.setLngOrigen(solicitud.lngOrigen());
        entidad.setLatDestino(solicitud.latDestino());
        entidad.setLngDestino(solicitud.lngDestino());
        entidad.setDistanciaKm(solicitud.distanciaKm());
        entidad.setDuracionMin(solicitud.duracionMin());
        entidad.setGeometriaJson(geometriaJson);
        entidad.setFechaCreacion(Instant.now());

        RutaGuardada guardada = rutaGuardadaRepository.save(entidad);
        return RutaGuardadaResponse.desde(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RutaGuardadaResponse> listarRutas(UUID usuarioId) {
        return rutaGuardadaRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(RutaGuardadaResponse::desde)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RutaGuardadaResponse obtenerRuta(UUID id, UUID usuarioId) {
        RutaGuardada ruta = rutaGuardadaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Ruta guardada no encontrada."));
        return RutaGuardadaResponse.desde(ruta);
    }

    @Override
    public void eliminarRuta(UUID id, UUID usuarioId) {
        RutaGuardada ruta = rutaGuardadaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("id", "Ruta guardada no encontrada."));
        rutaGuardadaRepository.delete(ruta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioRutaAfectada> buscarUsuariosConRutaCercana(double lat, double lng, double radioMetros) {
        List<RutaGuardada> todas = rutaGuardadaRepository.findAll();
        List<UsuarioRutaAfectada> afectados = new ArrayList<>();
        Set<String> alertasEnviadas = new HashSet<>();

        for (RutaGuardada ruta : todas) {
            List<double[]> puntos;
            try {
                puntos = OBJECT_MAPPER.readValue(ruta.getGeometriaJson(), new TypeReference<List<double[]>>() {});
            } catch (Exception e) {
                continue;
            }

            double distanciaMinimaMetros = calcularDistanciaMinimaMetros(lat, lng, puntos);
            if (distanciaMinimaMetros <= radioMetros) {
                String claveAlerta = ruta.getUsuarioId() + "-" + ruta.getId();
                if (!alertasEnviadas.contains(claveAlerta)) {
                    alertasEnviadas.add(claveAlerta);
                    try {
                        RespuestaUsuario usuario = servicioRegistro.obtenerPorId(ruta.getUsuarioId());
                        afectados.add(new UsuarioRutaAfectada(
                                ruta.getUsuarioId(),
                                usuario.correo(),
                                usuario.nombre(),
                                ruta.getNombre()));
                    } catch (Exception e) {
                        LOGGER.warn("No se pudo obtener datos del usuario {} para alerta de ruta", ruta.getUsuarioId());
                    }
                }
            }
        }
        return afectados;
    }

    public static double calcularDistanciaMinimaMetros(double pLat, double pLng, List<double[]> puntos) {
        if (puntos == null || puntos.isEmpty()) {
            return Double.MAX_VALUE;
        }
        double minDistKm = Double.MAX_VALUE;
        for (double[] pt : puntos) {
            double d = OrsAdapter.calcularDistanciaKm(pLat, pLng, pt[0], pt[1]);
            if (d < minDistKm) {
                minDistKm = d;
            }
        }
        return minDistKm * 1000.0;
    }
}
