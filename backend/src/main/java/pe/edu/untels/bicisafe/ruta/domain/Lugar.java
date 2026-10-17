package pe.edu.untels.bicisafe.ruta.domain;

/**
 * A place suggestion (e.g. a street, park or landmark in Lima) returned by a geocoding
 * provider (e.g. Nominatim).
 */
public record Lugar(String nombre, Punto punto) {
}
