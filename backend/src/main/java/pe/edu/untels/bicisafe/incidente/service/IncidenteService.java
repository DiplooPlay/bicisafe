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

    List<Incidente> listarPorUsuario(UUID usuarioId);

    long contarPorUsuario(UUID usuarioId);

    Incidente reportarIncidente(IncidenteRequest solicitud, String nombreAutor);

    Incidente reportarIncidente(IncidenteRequest solicitud, String nombreAutor, UUID usuarioId);

    Incidente confirmarIncidente(UUID id);

    Incidente resolverIncidente(UUID id);

    Incidente denunciarIncidente(UUID id, UUID usuarioId, String motivo, String comentario);

    void expirarIncidentesVencidos();

    List<Incidente> listarIncidentesCercanosARuta(List<double[]> puntos, double radioMetros);
}
