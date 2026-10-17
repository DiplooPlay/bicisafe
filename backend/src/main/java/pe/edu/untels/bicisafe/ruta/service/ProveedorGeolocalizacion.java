package pe.edu.untels.bicisafe.ruta.service;

import java.util.List;

import pe.edu.untels.bicisafe.ruta.domain.Lugar;

/**
 * Port to an external geocoding engine (see integration/osm). The ruta module declares
 * it; the Nominatim adapter implements it (ports &amp; adapters).
 */
public interface ProveedorGeolocalizacion {

    /**
     * Searches places matching a free-text query, restricted to the coverage area
     * (Lima Sur surroundings).
     *
     * @param texto    non-blank search text
     * @param limite   maximum number of results
     * @return matching places ordered by relevance
     * @throws pe.edu.untels.bicisafe.compartido.excepcion.IntegracionExcepcion
     *         when the provider is unreachable or rejects the request
     */
    List<Lugar> buscarLugares(String texto, int limite);
}
