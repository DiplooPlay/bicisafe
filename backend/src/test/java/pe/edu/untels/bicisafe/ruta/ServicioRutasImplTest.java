package pe.edu.untels.bicisafe.ruta;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import pe.edu.untels.bicisafe.compartido.excepcion.EntradaInvalidaExcepcion;
import pe.edu.untels.bicisafe.ruta.domain.Lugar;
import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;
import pe.edu.untels.bicisafe.ruta.service.ProveedorGeolocalizacion;
import pe.edu.untels.bicisafe.ruta.service.ProveedorRutas;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutasImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ServicioRutasImplTest {

    private final ProveedorGeolocalizacion geolocalizacion = mock(ProveedorGeolocalizacion.class);
    private final ProveedorRutas proveedorRutas = mock(ProveedorRutas.class);
    private final ServicioRutasImpl servicio = new ServicioRutasImpl(geolocalizacion, proveedorRutas, 6);

    @Test
    @DisplayName("la búsqueda solo consulta el proveedor con textos de 3 o más caracteres")
    void shouldSearchPlacesOnlyWithEnoughText() {
        List<Lugar> sugerencias = List.of(
                new Lugar("Parque Kennedy, Miraflores", Punto.de(-12.1217, -77.0298)));
        when(geolocalizacion.buscarLugares("Parque Kennedy", 6)).thenReturn(sugerencias);

        assertThat(servicio.buscarLugares("Parque Kennedy")).isEqualTo(sugerencias);
        verify(geolocalizacion).buscarLugares("Parque Kennedy", 6);

        assertThat(servicio.buscarLugares("  ")).isEmpty();
        assertThat(servicio.buscarLugares("pe")).isEmpty();
        verify(geolocalizacion, never()).buscarLugares(org.mockito.ArgumentMatchers.eq("pe"), org.mockito.ArgumentMatchers.anyInt());
    }

    @Test
    @DisplayName("rechazar la planificación cuando el origen y el destino coinciden")
    void shouldRejectSameOriginAndDestination() {
        Punto punto = Punto.de(-12.1217, -77.0298);

        assertThatThrownBy(() -> servicio.planificarRuta(punto, punto))
                .isInstanceOf(EntradaInvalidaExcepcion.class)
                .hasMessageContaining("distintos");

        verify(proveedorRutas, never()).planificarRutaCiclista(punto, punto);
    }

    @Test
    @DisplayName("planificar la ruta delegando en el puerto del proveedor de rutas")
    void shouldPlanRouteThroughRoutingPort() {
        Punto origen = Punto.de(-12.1217, -77.0298);
        Punto destino = Punto.de(-12.1965, -76.9632);
        Ruta esperada = new Ruta(List.of(origen, destino), 9.4, 38);
        when(proveedorRutas.planificarRutaCiclista(origen, destino)).thenReturn(esperada);

        assertThat(servicio.planificarRuta(origen, destino)).isEqualTo(esperada);
    }
}
