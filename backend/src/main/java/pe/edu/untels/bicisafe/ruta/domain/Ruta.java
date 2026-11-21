package pe.edu.untels.bicisafe.ruta.domain;

import java.util.List;

/**
 * A cycling route returned by a routing provider (e.g. OpenRouteService).
 *
 * @param puntoRecorrido path vertices as (lat, lng) pairs, ordered from origin to destination
 * @param distanciaKm    total length in kilometers
 * @param duracionMin    expected travel duration in minutes
 * @param elevacionGanadaMetros total climbing in meters (HU-08)
 * @param elevacionPerdidaMetros total descent in meters (HU-08)
 * @param perfilElevacion sampled elevation points along the route (HU-08)
 */
public record Ruta(
        List<Punto> puntoRecorrido,
        double distanciaKm,
        long duracionMin,
        double elevacionGanadaMetros,
        double elevacionPerdidaMetros,
        List<PuntoElevacion> perfilElevacion) {

    public Ruta(List<Punto> puntoRecorrido, double distanciaKm, long duracionMin) {
        this(puntoRecorrido, distanciaKm, duracionMin, 0.0, 0.0, List.of());
    }
}
