package pe.edu.untels.bicisafe.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT settings from {@code app.jwt.*} (application.yml / env vars).
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtPropiedades(String secret, long expirationMinutes, String issuer) {
}
