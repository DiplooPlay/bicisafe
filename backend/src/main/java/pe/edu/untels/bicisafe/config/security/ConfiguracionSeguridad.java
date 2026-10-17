package pe.edu.untels.bicisafe.config.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import tools.jackson.databind.ObjectMapper;

import pe.edu.untels.bicisafe.config.web.CuerpoError;

/**
 * Stateless security: JWT filter, public routes (auth, actuator, Swagger) and BCrypt.
 * Everything else requires authentication.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(JwtPropiedades.class)
public class ConfiguracionSeguridad {

    /** Auth + visitor stories (E2 route planning) are public; the rest requires a JWT. */
    private static final String[] RUTAS_PUBLICAS = {
            "/api/auth/**",
            "/api/lugares/**",
            "/api/rutas/**",
            "/actuator/health",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/error"
    };

    /**
     * Visitors may read incident reports, but only authenticated cyclists may
     * report or vote (E1): POST writes stay behind the JWT filter.
     */
    private static final String[] LECTURA_PUBLICA_INCIDENTES = {
            "/api/incidentes/activos",
            "/api/incidentes",
            "/api/incidentes/*"
    };

    private final JwtAutenticacionFiltro jwtAutenticacionFiltro;
    private final ObjectMapper objectMapper;

    public ConfiguracionSeguridad(JwtAutenticacionFiltro jwtAutenticacionFiltro, ObjectMapper objectMapper) {
        this.jwtAutenticacionFiltro = jwtAutenticacionFiltro;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain cadenaFiltrosSeguridad(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // Uses the CorsConfigurationSource bean from config/web.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(RUTAS_PUBLICAS).permitAll()
                        .requestMatchers(HttpMethod.GET, LECTURA_PUBLICA_INCIDENTES).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(excepciones -> excepciones
                        .authenticationEntryPoint(this::responderNoAutenticado))
                .addFilterBefore(jwtAutenticacionFiltro, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /** Returns a 401 with the standard JSON error body for unauthenticated requests. */
    private void responderNoAutenticado(
            jakarta.servlet.http.HttpServletRequest peticion,
            jakarta.servlet.http.HttpServletResponse respuesta,
            org.springframework.security.core.AuthenticationException excepcion) throws java.io.IOException {

        respuesta.setStatus(HttpStatus.UNAUTHORIZED.value());
        respuesta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(respuesta.getWriter(), CuerpoError.de("Debes iniciar sesión para acceder a este recurso."));
    }
}
