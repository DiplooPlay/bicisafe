package pe.edu.untels.bicisafe.ruta.service;

import java.util.List;
import java.util.UUID;

import pe.edu.untels.bicisafe.ruta.dto.GuardarRutaRequest;
import pe.edu.untels.bicisafe.ruta.dto.RutaGuardadaResponse;
import pe.edu.untels.bicisafe.ruta.dto.UsuarioRutaAfectada;

/**
 * Service port for managing saved frequent routes (HU-16) and route-incident alerts (HU-17).
 */
public interface ServicioRutaGuardada {

    RutaGuardadaResponse guardarRuta(UUID usuarioId, GuardarRutaRequest solicitud);

    List<RutaGuardadaResponse> listarRutas(UUID usuarioId);

    RutaGuardadaResponse obtenerRuta(UUID id, UUID usuarioId);

    void eliminarRuta(UUID id, UUID usuarioId);

    List<UsuarioRutaAfectada> buscarUsuariosConRutaCercana(double lat, double lng, double radioMetros);
}
