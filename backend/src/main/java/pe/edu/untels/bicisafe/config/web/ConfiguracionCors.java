package pe.edu.untels.bicisafe.config.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS for the SPA. The security filter chain consumes the {@link CorsConfigurationSource}
 * bean created here (cors default handling).
 */
@Configuration
public class ConfiguracionCors {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String origenesPermitidos) {
        CorsConfiguration configuracion = new CorsConfiguration();
        for (String origen : origenesPermitidos.split(",")) {
            configuracion.addAllowedOrigin(origen.trim());
        }
        configuracion.addAllowedMethod("*");
        configuracion.addAllowedHeader("*");
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", configuracion);
        return fuente;
    }
}
