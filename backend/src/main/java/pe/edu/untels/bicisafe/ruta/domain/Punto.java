package pe.edu.untels.bicisafe.ruta.domain;

/**
 * Latitude/longitude pair (WGS84 decimal degrees). Shared by place search results and
 * route endpoints on both sides of every port in this module.
 */
public record Punto(double latitud, double longitud) {

    public static Punto de(double latitud, double longitud) {
        return new Punto(latitud, longitud);
    }
}
