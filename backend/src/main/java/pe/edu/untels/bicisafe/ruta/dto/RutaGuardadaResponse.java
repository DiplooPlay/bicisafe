package pe.edu.untels.bicisafe.ruta.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import pe.edu.untels.bicisafe.ruta.domain.RutaGuardada;

/**
 * Saved route response with cached geometry to avoid recalculation (HU-16).
 */
public record RutaGuardadaResponse(
        UUID id,
        String nombre,
        String origenNombre,
        String destinoNombre,
        double latOrigen,
        double lngOrigen,
        double latDestino,
        double lngDestino,
        double distanciaKm,
        long duracionMin,
        List<double[]> puntos,
        Instant fechaCreacion
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static RutaGuardadaResponse desde(RutaGuardada entidad) {
        List<double[]> puntos;
        try {
            puntos = OBJECT_MAPPER.readValue(entidad.getGeometriaJson(), new TypeReference<List<double[]>>() {});
        } catch (Exception e) {
            puntos = List.of(
                    new double[] { entidad.getLatOrigen(), entidad.getLngOrigen() },
                    new double[] { entidad.getLatDestino(), entidad.getLngDestino() }
            );
        }
        return new RutaGuardadaResponse(
                entidad.getId(),
                entidad.getNombre(),
                entidad.getOrigenNombre(),
                entidad.getDestinoNombre(),
                entidad.getLatOrigen(),
                entidad.getLngOrigen(),
                entidad.getLatDestino(),
                entidad.getLngDestino(),
                entidad.getDistanciaKm(),
                entidad.getDuracionMin(),
                puntos,
                entidad.getFechaCreacion()
        );
    }
}
