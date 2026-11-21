package pe.edu.untels.bicisafe.ruta.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload to save a frequent cycling route (HU-16).
 */
public record GuardarRutaRequest(
        @NotBlank(message = "El nombre de la ruta no puede estar vacío")
        @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
        String nombre,

        String origenNombre,
        String destinoNombre,

        @NotNull double latOrigen,
        @NotNull double lngOrigen,
        @NotNull double latDestino,
        @NotNull double lngDestino,
        double distanciaKm,
        long duracionMin,

        @NotEmpty(message = "Los puntos del recorrido son obligatorios")
        List<double[]> puntos
) {
}
