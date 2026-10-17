package pe.edu.untels.bicisafe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Base URL of the SPA, used by backend services to build frontend links
 * (e.g. the email verification link).
 */
@ConfigurationProperties(prefix = "app.frontend")
public record PropiedadesUrlFrontend(String baseUrl) {
}
