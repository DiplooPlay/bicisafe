package pe.edu.untels.bicisafe.ruta.service;

import java.util.List;

import pe.edu.untels.bicisafe.ruta.domain.Lugar;
import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.domain.Ruta;

/**
 * E2 internal API: place search and bike route planning for visitors and cyclists.
 */
public interface ServicioRutas {

    /**
     * Search story: suggestions for texts typed by the user. Minimum length is enforced
     * to keep the external provider happy.
     *
     * @param texto partial address or landmark name in Lima
     * @return matching places
     */
    List<Lugar> buscarLugares(String texto);

    /**
     * Route planning story: bike route with total distance and estimated duration.
     *
     * @param origen  start point
     * @param destino end point
     * @return the planned route
     */
    Ruta planificarRuta(Punto origen, Punto destino);
}
