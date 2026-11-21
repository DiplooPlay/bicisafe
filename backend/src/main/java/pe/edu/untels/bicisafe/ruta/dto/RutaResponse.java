package pe.edu.untels.bicisafe.ruta.dto;

import java.util.List;

import pe.edu.untels.bicisafe.ruta.domain.PuntoElevacion;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;

/**
 * Public route response: total distance, estimated duration, path geometry and
 * elevation profile (HU-08).
 */
public record RutaResponse(
        double distanciaKm,
        long duracionMin,
        List<double[]> puntoRecorrido,
        double elevacionGanadaMetros,
        double elevacionPerdidaMetros,
        List<PuntoElevacion> perfilElevacion) {

    public static RutaResponse desde(Ruta ruta) {
        List<double[]> recorrido = ruta.puntoRecorrido().stream()
                .map(punto -> new double[] { punto.latitud(), punto.longitud() })
                .toList();
        return new RutaResponse(
                redondear(ruta.distanciaKm()),
                ruta.duracionMin(),
                recorrido,
                redondear(ruta.elevacionGanadaMetros()),
                redondear(ruta.elevacionPerdidaMetros()),
                ruta.perfilElevacion() != null ? ruta.perfilElevacion() : List.of());
    }

    private static double redondear(double valor) {
        return Math.round(valor * 10) / 10.0;
    }
}
