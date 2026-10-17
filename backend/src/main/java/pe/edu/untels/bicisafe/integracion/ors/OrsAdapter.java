package pe.edu.untels.bicisafe.integracion.ors;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import tools.jackson.databind.JsonNode;

import pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion;
import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;
import pe.edu.untels.bicisafe.ruta.service.ProveedorRutas;

/**
 * OpenRouteService adapter implementing {@link ProveedorRutas}. Requests the
 * {@code cycling-regular} profile and converts ORS GeoJSON to the domain model.
 *
 * <p>The ORS free tier rejects bursts (rate limit ~40 req/min); the service layer
 * caches results and keeps calls single-shot per user action.
 */
@Component
public class OrsAdapter implements ProveedorRutas {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrsAdapter.class);

    private static final String PERFIL_CICLISTA = "cycling-regular";
    private static final String MENSAJE_NO_DISPONIBLE =
            "El servicio de cálculo de rutas no está disponible. Intenta de nuevo en unos momentos.";
    private static final String MENSAJE_SIN_CUOTA =
            "Se alcanzó el límite de uso del servicio de rutas. Intenta más tarde.";

    private final RestClient clienteHttp;

    public OrsAdapter(
            RestClient.Builder constructorCliente,
            @Value("${app.ors.base-url}") String baseUrl,
            @Value("${app.ors.api-key}") String apiKey) {
        this.clienteHttp = constructorCliente
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public Ruta planificarRutaCiclista(Punto origen, Punto destino) {
        JsonNode respuesta;
        try {
            respuesta = clienteHttp.post()
                    .uri("/v2/directions/" + PERFIL_CICLISTA + "/geojson")
                    .body(cuerpoPeticion(origen, destino))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException excepcion) {
            if (excepcion.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS
                    || contieneCuotaAgotada(excepcion)) {
                throw new IntegracionExcepcion(MENSAJE_SIN_CUOTA);
            }
            if (esPuntoNoTransitable(excepcion)) {
                String cuerpo = excepcion.getResponseBodyAsString();
                if (cuerpo.contains("coordinate 0")) {
                    throw new IntegracionExcepcion(
                            "No se encontró una vía ciclista cerca del origen (zona no transitable o fuera de Lima). Si usas PC, escribe un origen en Lima en lugar del GPS.");
                } else if (cuerpo.contains("coordinate 1")) {
                    throw new IntegracionExcepcion(
                            "No se encontró una vía ciclista cerca del destino. Elige un lugar sobre una calle o ciclovía de Lima.");
                }
                throw new IntegracionExcepcion(
                        "No se encontró una ruta en bicicleta entre esos puntos. Selecciona ubicaciones transitables dentro de Lima.");
            }
            LOGGER.warn("ORS rechazó la petición: {} {}", excepcion.getStatusCode(), excepcion.getResponseBodyAsString());
            throw new IntegracionExcepcion(MENSAJE_NO_DISPONIBLE);
        } catch (RuntimeException excepcion) {
            LOGGER.warn("ORS no respondió: {}", excepcion.getMessage());
            throw new IntegracionExcepcion(MENSAJE_NO_DISPONIBLE);
        }

        return mapearRespuesta(respuesta);
    }

    private record CuerpoPeticion(List<double[]> coordinates) {
    }

    private CuerpoPeticion cuerpoPeticion(Punto origen, Punto destino) {
        // ORS expects (lng, lat); the domain stores (lat, lng).
        return new CuerpoPeticion(List.of(
                new double[] { origen.longitud(), origen.latitud() },
                new double[] { destino.longitud(), destino.latitud() }));
    }

    private Ruta mapearRespuesta(JsonNode respuesta) {
        JsonNode feature = respuesta.path("features").path(0);
        if (feature.isMissingNode()) {
            throw new IntegracionExcepcion("No se encontró una ruta en bicicleta entre esos puntos.");
        }

        JsonNode resumen = feature.path("properties").path("summary");
        double distanciaKm = resumen.path("distance").asDouble(0) / 1000.0;
        long duracionMin = Math.round(resumen.path("duration").asDouble(0) / 60.0);

        List<Punto> recorrido = new ArrayList<>();
        for (JsonNode coordenada : feature.path("geometry").path("coordinates")) {
            recorrido.add(Punto.de(coordenada.get(1).asDouble(), coordenada.get(0).asDouble()));
        }

        if (recorrido.isEmpty() || distanciaKm <= 0) {
            throw new IntegracionExcepcion(MENSAJE_NO_DISPONIBLE);
        }
        return new Ruta(recorrido, distanciaKm, duracionMin);
    }

    private boolean contieneCuotaAgotada(RestClientResponseException excepcion) {
        String cuerpo = excepcion.getResponseBodyAsString();
        return cuerpo.contains("2004") || cuerpo.toLowerCase().contains("quota");
    }

    private boolean esPuntoNoTransitable(RestClientResponseException excepcion) {
        String cuerpo = excepcion.getResponseBodyAsString();
        return cuerpo.contains("2010")
                || cuerpo.contains("2099")
                || cuerpo.toLowerCase().contains("routable point")
                || cuerpo.toLowerCase().contains("no route could be found");
    }
}
