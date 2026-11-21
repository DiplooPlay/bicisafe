package pe.edu.untels.bicisafe.ruta.domain;

/**
 * Latitude/longitude/elevation point (WGS84 decimal degrees).
 */
public record Punto(double latitud, double longitud, Double elevacion) {

    public Punto(double latitud, double longitud) {
        this(latitud, longitud, 0.0);
    }

    public static Punto de(double latitud, double longitud) {
        return new Punto(latitud, longitud, 0.0);
    }

    public static Punto de(double latitud, double longitud, Double elevacion) {
        return new Punto(latitud, longitud, elevacion != null ? elevacion : 0.0);
    }
}
