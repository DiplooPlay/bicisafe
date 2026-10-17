package pe.edu.untels.bicisafe.integracion;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion;
import pe.edu.untels.bicisafe.integracion.osm.NominatimAdapter;
import pe.edu.untels.bicisafe.ruta.service.ProveedorGeolocalizacion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/**
 * Validates the Nominatim adapter contract (E2 place search for Lima).
 */
class NominatimAdapterTest {

    private static final String RESPUESTA_NOMINATIM = """
            [
              {
                "place_id": 111,
                "display_name": "Parque Kennedy, Miraflores, Lima, Perú",
                "lat": "-12.121700",
                "lon": "-77.029800"
              },
              {
                "place_id": 112,
                "display_name": "UNTELS, Villa El Salvador, Lima, Perú",
                "lat": "-12.196500",
                "lon": "-76.963200"
              }
            ]
            """;

    private MockRestServiceServer servidor;
    private ProveedorGeolocalizacion proveedor;

    @BeforeEach
    void configurar() {
        RestClient.Builder constructor = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(constructor).build();
        proveedor = new NominatimAdapter(constructor, "https://nominatim.openstreetmap.org", "bicisafe");
    }

    @Test
    @DisplayName("buscar lugares en Lima enviando la consulta con límite y idioma")
    void shouldSearchPlacesWithinLima() {
        servidor.expect(requestTo(org.hamcrest.Matchers.startsWith("https://nominatim.openstreetmap.org/search")))
                .andExpect(method(HttpMethod.GET))
                .andExpect(queryParam("format", "jsonv2"))
                .andExpect(queryParam("q", "Parque%20Kennedy"))
                .andExpect(queryParam("limit", "6"))
                .andExpect(queryParam("viewbox", "-77.37,-12.42,-76.70,-11.80"))
                .andExpect(header("User-Agent", "bicisafe/0.1 (bicisafe app)"))
                .andRespond(withSuccess(RESPUESTA_NOMINATIM, MediaType.APPLICATION_JSON));

        List<pe.edu.untels.bicisafe.ruta.domain.Lugar> lugares = proveedor.buscarLugares("Parque Kennedy", 6);

        assertThat(lugares).hasSize(2);
        assertThat(lugares.get(0).nombre()).contains("Parque Kennedy");
        assertThat(lugares.get(0).punto().latitud()).isEqualTo(-12.1217);
        assertThat(lugares.get(1).punto().longitud()).isEqualTo(-76.9632);
        servidor.verify();
    }

    @Test
    @DisplayName("lanzar IntegracionExcepcion cuando Nominatim no responde")
    void shouldFailGracefullyWhenNominatimIsUnavailable() {
        servidor.expect(requestTo(org.hamcrest.Matchers.startsWith("https://nominatim.openstreetmap.org/search")))
                .andRespond(withServerError());

        assertThatThrownBy(() -> proveedor.buscarLugares("Jockey Plaza", 6))
                .isInstanceOf(IntegracionExcepcion.class)
                .hasMessageContaining("no está disponible");
    }
}
