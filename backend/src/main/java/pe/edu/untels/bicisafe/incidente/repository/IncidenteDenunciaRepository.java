package pe.edu.untels.bicisafe.incidente.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.untels.bicisafe.incidente.domain.IncidenteDenuncia;

/**
 * Spring Data JPA repository for incident moderation reports (HU-14).
 */
public interface IncidenteDenunciaRepository extends JpaRepository<IncidenteDenuncia, UUID> {

    long countByIncidenteId(UUID incidenteId);

    boolean existsByIncidenteIdAndUsuarioId(UUID incidenteId, UUID usuarioId);
}
