package pe.edu.untels.bicisafe.ruta.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import pe.edu.untels.bicisafe.compartido.excepcion.EntradaInvalidaExcepcion;
import pe.edu.untels.bicisafe.ruta.domain.Lugar;
import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;

/**
 * E2 business logic. Delegates all external calls to the declared ports
 * ({@link ProveedorGeolocalizacion}, {@link ProveedorRutas}); results are cached to
 * respect the providers' free-tier rate limits.
 */
@Service
public class ServicioRutasImpl implements ServicioRutas {

    private static final int LONGITUD_MINIMA_BUSQUEDA = 3;
    private static final double METROS_MAXIMO_MISMO_PUNTO = 50.0;
    private static final double METROS_POR_GRADO_LATITUD = 111_320.0;

    private final ProveedorGeolocalizacion proveedorGeolocalizacion;
    private final ProveedorRutas proveedorRutas;
    private final int limiteBusqueda;

    public ServicioRutasImpl(
            ProveedorGeolocalizacion proveedorGeolocalizacion,
            ProveedorRutas proveedorRutas,
            @Value("${app.busqueda.limite-resultados:6}") int limiteBusqueda) {
        this.proveedorGeolocalizacion = proveedorGeolocalizacion;
        this.proveedorRutas = proveedorRutas;
        this.limiteBusqueda = limiteBusqueda;
    }

    @Override
    @Cacheable(cacheNames = "busquedaLugares", key = "#texto != null ? #texto.toLowerCase() : '-'")
    public List<Lugar> buscarLugares(String texto) {
        if (!StringUtils.hasText(texto) || texto.trim().length() < LONGITUD_MINIMA_BUSQUEDA) {
            return List.of();
        }
        return proveedorGeolocalizacion.buscarLugares(texto.trim(), limiteBusqueda);
    }

    @Override
    @Cacheable(cacheNames = "rutasPlanificadas", unless = "#result == null")
    public Ruta planificarRuta(Punto origen, Punto destino) {
        if (origen == null || destino == null) {
            throw new EntradaInvalidaExcepcion("Debes indicar un origen y un destino válidos.");
        }
        if (sonElMismoPunto(origen, destino)) {
            throw new EntradaInvalidaExcepcion("El origen y el destino deben ser lugares distintos.");
        }
        return proveedorRutas.planificarRutaCiclista(origen, destino);
    }

    private boolean sonElMismoPunto(Punto origen, Punto destino) {
        double deltaLatitud = Math.abs(origen.latitud() - destino.latitud()) * METROS_POR_GRADO_LATITUD;
        double deltaLongitud = Math.abs(origen.longitud() - destino.longitud())
                * METROS_POR_GRADO_LATITUD * Math.cos(Math.toRadians(origen.latitud()));
        double distanciaMetros = Math.sqrt(deltaLatitud * deltaLatitud + deltaLongitud * deltaLongitud);
        return distanciaMetros <= METROS_MAXIMO_MISMO_PUNTO;
    }
}
