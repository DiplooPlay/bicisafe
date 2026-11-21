package pe.edu.untels.bicisafe.ruta.domain;

/**
 * An elevation sample along a route profile (HU-08).
 *
 * @param distanciaKm distance from route origin in kilometers
 * @param elevacionMetros elevation above sea level in meters
 */
public record PuntoElevacion(double distanciaKm, double elevacionMetros) {
}
