package pe.edu.untels.bicisafe.integracion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion;
import pe.edu.untels.bicisafe.integracion.ors.OrsAdapter;
import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;
import pe.edu.untels.bicisafe.ruta.service.ProveedorRutas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;

/**
 * Validates the OpenRouteService adapter contract (E2 route calculation).
 */
class OrsAdapterTest {

    private static final String RUTA_GEOJSON = """
            {
              "type": "FeatureCollection",
              "features": [{
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[-77.0298, -12.1217], [-76.9632, -12.1965]]},
                "properties": {"summary": {"distance": 9400.0, "duration": 2280.0}}
              }]
            }
            """;

    private MockRestServiceServer servidor;
    private ProveedorRutas proveedor;

    @BeforeEach
    void configurar() {
        RestClient.Builder constructor = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(constructor).build();
        proveedor = new OrsAdapter(constructor, "https://api.openrouteservice.org", "clave-ors");
    }

    @Test
    @DisplayName("calcular la ruta cíclicamente y traducir la respuesta GeoJSON de ORS")
    void shouldPlanCyclingRouteFromGeoJsonResponse() {
        servidor.expect(requestTo("https://api.openrouteservice.org/v2/directions/cycling-regular/geojson"))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andExpect(header("Authorization", "clave-ors"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("[[-77.0298,-12.1217],[-76.9632,-12.1965]]")))
                .andRespond(withSuccess(RUTA_GEOJSON, MediaType.APPLICATION_JSON));

        Ruta ruta = proveedor.planificarRutaCiclista(Punto.de(-12.1217, -77.0298), Punto.de(-12.1965, -76.9632));

        assertThat(ruta.distanciaKm()).isEqualTo(9.4);
        assertThat(ruta.duracionMin()).isEqualTo(38);
        assertThat(ruta.puntoRecorrido())
                .containsExactly(Punto.de(-12.1217, -77.0298), Punto.de(-12.1965, -76.9632));
        servidor.verify();
    }

    @Test
    @DisplayName("lanzar IntegracionExcepcion si ORS está fuera de servicio")
    void shouldFailGracefullyWhenOrsReturnsError() {
        servidor.expect(requestTo(org.hamcrest.Matchers.startsWith("https://api.openrouteservice.org")))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> proveedor.planificarRutaCiclista(
                Punto.de(-12.1217, -77.0298), Punto.de(-12.1965, -76.9632)))
                .isInstanceOf(IntegracionExcepcion.class)
                .hasMessageContaining("no está disponible");
    }

    @Test
    @DisplayName("traducir un error de red a IntegracionExcepcion")
    void shouldFailGracefullyWhenOrsIsUnreachable() {
        servidor.expect(requestTo(org.hamcrest.Matchers.startsWith("https://api.openrouteservice.org")))
                .andRespond(withException(new java.io.IOException("conexión rechazada")));

        assertThatThrownBy(() -> proveedor.planificarRutaCiclista(
                Punto.de(-12.1217, -77.0298), Punto.de(-12.1965, -76.9632)))
                .isInstanceOf(IntegracionExcepcion.class);
    }
}
