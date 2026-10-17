package pe.edu.untels.bicisafe.incidente.service;

import java.util.List;
import java.util.UUID;

import pe.edu.untels.bicisafe.incidente.domain.Incidente;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteRequest;

/**
 * Service port for incident reporting, querying, and community consensus.
 */
public interface IncidenteService {

    List<Incidente> listarActivos();

    List<Incidente> listarTodos();

    Incidente reportarIncidente(IncidenteRequest solicitud, String nombreAutor);

    Incidente confirmarIncidente(UUID id);

    Incidente resolverIncidente(UUID id);
}
