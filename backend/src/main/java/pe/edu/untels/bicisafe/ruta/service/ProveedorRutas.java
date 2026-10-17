package pe.edu.untels.bicisafe.ruta.service;

import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;

/**
 * Port to an external cycling routing engine (see integration/ors). The ruta module
 * declares it; adapters in {@code integration} implement it (ports &amp; adapters).
 */
public interface ProveedorRutas {

    /**
     * Calculates a bike route between two points.
     *
     * @param origen  route start point
     * @param destino route end point
     * @return the planned route with geometry, distance and duration
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion
     *         when the provider is unreachable or rejects the request
     */
    Ruta planificarRutaCiclista(Punto origen, Punto destino);
}
