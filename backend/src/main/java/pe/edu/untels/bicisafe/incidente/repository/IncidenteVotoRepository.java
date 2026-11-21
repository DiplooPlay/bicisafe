package pe.edu.untels.bicisafe.incidente.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.untels.bicisafe.incidente.domain.IncidenteVoto;

public interface IncidenteVotoRepository extends JpaRepository<IncidenteVoto, UUID> {
    boolean existsByIncidenteIdAndUsuarioId(UUID incidenteId, UUID usuarioId);
    boolean existsByIncidenteIdAndVotanteId(UUID incidenteId, String votanteId);
}
