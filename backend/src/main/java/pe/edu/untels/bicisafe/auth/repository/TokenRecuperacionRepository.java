package pe.edu.untels.bicisafe.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.untels.bicisafe.auth.domain.TokenRecuperacion;

/**
 * Spring Data JPA repository for password recovery tokens (HU-03).
 */
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, UUID> {

    Optional<TokenRecuperacion> findByToken(String token);
}
