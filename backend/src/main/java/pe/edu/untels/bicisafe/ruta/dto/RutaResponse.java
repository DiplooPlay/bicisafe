package pe.edu.untels.bicisafe.ruta.dto;

import java.util.List;

import pe.edu.untels.bicisafe.ruta.domain.Ruta;

/**
 * Public route response: total distance, estimated duration and the path as
 * {@code [[lat, lng], ...]} pairs following the Leaflet convention.
 */
public record RutaResponse(double distanciaKm, long duracionMin, List<double[]> puntoRecorrido) {

    public static RutaResponse desde(Ruta ruta) {
        List<double[]> recorrido = ruta.puntoRecorrido().stream()
                .map(punto -> new double[] { punto.latitud(), punto.longitud() })
                .toList();
        return new RutaResponse(redondear(ruta.distanciaKm()), ruta.duracionMin(), recorrido);
    }

    private static double redondear(double valor) {
        return Math.round(valor * 10) / 10.0;
    }
}
