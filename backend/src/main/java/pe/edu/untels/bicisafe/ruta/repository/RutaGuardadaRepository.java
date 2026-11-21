package pe.edu.untels.bicisafe.ruta.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.untels.bicisafe.ruta.domain.RutaGuardada;

/**
 * Spring Data JPA repository for cyclist saved routes (HU-16).
 */
public interface RutaGuardadaRepository extends JpaRepository<RutaGuardada, UUID> {

    List<RutaGuardada> findByUsuarioIdOrderByFechaCreacionDesc(UUID usuarioId);

    Optional<RutaGuardada> findByIdAndUsuarioId(UUID id, UUID usuarioId);
}
