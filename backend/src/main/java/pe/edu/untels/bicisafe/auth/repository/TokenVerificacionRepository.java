package pe.edu.untels.bicisafe.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.untels.bicisafe.auth.domain.TokenVerificacion;

public interface TokenVerificacionRepository extends JpaRepository<TokenVerificacion, UUID> {

    Optional<TokenVerificacion> findByToken(String token);
}
