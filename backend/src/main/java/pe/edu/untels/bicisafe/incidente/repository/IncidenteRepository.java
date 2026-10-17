package pe.edu.untels.bicisafe.incidente.repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.untels.bicisafe.incidente.domain.EstadoIncidente;
import pe.edu.untels.bicisafe.incidente.domain.Incidente;

/**
 * Spring Data JPA repository for incidents.
 */
public interface IncidenteRepository extends JpaRepository<Incidente, UUID> {

    List<Incidente> findByEstadoNotAndFechaExpiracionAfterOrderByFechaCreacionDesc(
            EstadoIncidente estado,
            Instant ahora
    );

    List<Incidente> findAllByOrderByFechaCreacionDesc();
}
