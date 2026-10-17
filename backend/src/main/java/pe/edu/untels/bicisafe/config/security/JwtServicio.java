package pe.edu.untels.bicisafe.config.security;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import pe.edu.untels.bicisafe.auth.domain.RolUsuario;
import pe.edu.untels.bicisafe.auth.domain.Usuario;

/**
 * Creates and validates the HS256 JWT with claims subject <em>userId</em>,
 * <em>email</em> and <em>role</em>, as described in config/security README.
 */
@Component
public class JwtServicio {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtServicio.class);

    private final SecretKey clave;
    private final long expiracionMinutos;
    private final String emisor;
    private final JwtParser parser;

    private final java.util.Set<String> tokensInvalidados = java.util.concurrent.ConcurrentHashMap.newKeySet();

    public JwtServicio(JwtPropiedades propiedades) {
        this.clave = Keys.hmacShaKeyFor(propiedades.secret().getBytes());
        this.expiracionMinutos = propiedades.expirationMinutes();
        this.emisor = propiedades.issuer();
        this.parser = Jwts.parser().verifyWith(clave).requireIssuer(emisor).build();
    }

    public void invalidar(String token) {
        if (token != null && !token.isBlank()) {
            tokensInvalidados.add(token.trim());
        }
    }

    public boolean estaInvalido(String token) {
        return token != null && tokensInvalidados.contains(token.trim());
    }

    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        Instant expiracion = ahora.plusSeconds(expiracionMinutos * 60);

        return Jwts.builder()
                .subject(usuario.getId().toString())
                // Unique per token: two logins in the same second must not collide
                // (iat/exp have second resolution and would otherwise be identical).
                .id(UUID.randomUUID().toString())
                .claim("email", usuario.getCorreo())
                .claim("role", usuario.getRol().name())
                .issuer(emisor)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expiracion))
                .signWith(clave)
                .compact();
    }

    /**
     * Verifies signature, expiration and issuer.
     *
     * @return the authenticated principal when the token is valid; empty otherwise
     */
    public Optional<UsuarioAutenticado> validar(String token) {
        if (estaInvalido(token)) {
            LOGGER.debug("JWT revocado: token en lista negra de logout");
            return Optional.empty();
        }
        try {
            Claims claims = parser.parseSignedClaims(token).getPayload();
            return Optional.of(new UsuarioAutenticado(
                    UUID.fromString(claims.getSubject()),
                    claims.get("email", String.class),
                    RolUsuario.valueOf(claims.get("role", String.class))));
        } catch (RuntimeException excepcion) {
            // Expired, tampered or otherwise invalid tokens simply mean "not authenticated".
            LOGGER.debug("JWT inválido: {}", excepcion.getMessage());
            return Optional.empty();
        }
    }

    public long getExpiracionMinutos() {
        return expiracionMinutos;
    }
}
