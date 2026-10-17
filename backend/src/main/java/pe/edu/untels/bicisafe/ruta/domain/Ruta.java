package pe.edu.untels.bicisafe.ruta.domain;

/**
 * A cycling route returned by a routing provider (e.g. OpenRouteService).
 *
 * @param puntoRecorrido path vertices as (lat, lng) pairs, ordered from origin to destination
 * @param distanciaKm    total length in kilometers
 * @param duracionMin    expected travel duration in minutes
 */
public record Ruta(java.util.List<Punto> puntoRecorrido, double distanciaKm, long duracionMin) {
}
