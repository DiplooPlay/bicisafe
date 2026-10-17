package pe.edu.untels.bicisafe.integracion.osm;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import tools.jackson.databind.JsonNode;

import pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion;
import pe.edu.untels.bicisafe.ruta.domain.Lugar;
import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.service.ProveedorGeolocalizacion;

/**
 * Nominatim (OpenStreetMap) adapter implementing {@link ProveedorGeolocalizacion}.
 *
 * <p>Nominatim requires a descriptive {@code User-Agent} and limits automated use to
 * 1 request/second; the {@code bounded}-viewbox query restricts results to Lima's area
 * and the service layer caches responses to respect those limits.
 */
@Component
public class NominatimAdapter implements ProveedorGeolocalizacion {

    private static final Logger LOGGER = LoggerFactory.getLogger(NominatimAdapter.class);

    /** Lima Metropolitana + Callao bounding box: minLng, minLat, maxLng, maxLat. */
    private static final String CAJA_LIMA = "-77.37,-12.42,-76.70,-11.80";
    private static final String MENSAJE_SERVICIO_NO_DISPONIBLE =
            "El servicio de búsqueda de lugares no está disponible. Intenta en unos segundos.";

    private final RestClient clienteHttp;
    private final String agenteUsuario;

    public NominatimAdapter(
            RestClient.Builder constructorCliente,
            @Value("${app.osm.nominatim.base-url:https://nominatim.openstreetmap.org}") String baseUrl,
            @Value("${spring.application.name:bicisafe}") String nombreAplicacion) {
        this.agenteUsuario = nombreAplicacion + "/0.1 (bicisafe app)";
        this.clienteHttp = constructorCliente
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", agenteUsuario)
                .build();
    }

    @Override
    public List<Lugar> buscarLugares(String texto, int limite) {
        JsonNode[] resultados;
        try {
            resultados = clienteHttp.get()
                    .uri(uri -> uri.path("/search")
                            .queryParam("format", "jsonv2")
                            .queryParam("q", texto)
                            .queryParam("limit", limite)
                            .queryParam("accept-language", "es")
                            .queryParam("countrycodes", "pe")
                            .queryParam("viewbox", CAJA_LIMA)
                            .queryParam("bounded", "true")
                            .build())
                    .retrieve()
                    .body(JsonNode[].class);
        } catch (RestClientException excepcion) {
            LOGGER.warn("La búsqueda en Nominatim falló: {}", excepcion.getMessage());
            throw new IntegracionExcepcion(MENSAJE_SERVICIO_NO_DISPONIBLE);
        }

        if (resultados == null) {
            return List.of();
        }
        return mapearLugares(resultados);
    }

    private List<Lugar> mapearLugares(JsonNode[] resultados) {
        List<Lugar> lugares = new ArrayList<>(resultados.length);
        for (JsonNode resultado : resultados) {
            String nombre = resultado.path("display_name").asString(null);
            Punto punto = parsearPunto(resultado);
            if (nombre == null || punto == null) {
                continue;
            }
            lugares.add(new Lugar(nombre, punto));
        }
        return lugares;
    }

    private Punto parsearPunto(JsonNode resultado) {
        try {
            double latitud = Double.parseDouble(resultado.path("lat").asString());
            double longitud = Double.parseDouble(resultado.path("lon").asString());
            return Punto.de(latitud, longitud);
        } catch (NumberFormatException excepcion) {
            LOGGER.debug("Resultado sin coordenadas numéricas: {}", resultado);
            return null;
        }
    }
}
