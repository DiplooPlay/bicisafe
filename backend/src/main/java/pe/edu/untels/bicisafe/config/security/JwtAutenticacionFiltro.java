package pe.edu.untels.bicisafe.config.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Extracts the {@code Authorization: Bearer <jwt>} header and populates the security
 * context when the token is valid; otherwise the request continues unauthenticated.
 */
@Component
public class JwtAutenticacionFiltro extends OncePerRequestFilter {

    private static final String ENCABEZADO_AUTORIZACION = "Authorization";
    private static final String PREFIJO_BEARER = "Bearer ";
    private static final String PREFIJO_ROL = "ROLE_";

    private final JwtServicio jwtServicio;

    public JwtAutenticacionFiltro(JwtServicio jwtServicio) {
        this.jwtServicio = jwtServicio;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest peticion,
            HttpServletResponse respuesta,
            FilterChain cadena) throws ServletException, IOException {

        String encabezado = peticion.getHeader(ENCABEZADO_AUTORIZACION);
        if (encabezado != null && encabezado.startsWith(PREFIJO_BEARER)) {
            jwtServicio.validar(encabezado.substring(PREFIJO_BEARER.length()))
                    .ifPresent(this::establecerContexto);
        }

        cadena.doFilter(peticion, respuesta);
    }

    private void establecerContexto(UsuarioAutenticado usuario) {
        var autoridades = List.of(new SimpleGrantedAuthority(PREFIJO_ROL + usuario.rol().name()));
        var autenticacion = new UsernamePasswordAuthenticationToken(usuario, null, autoridades);
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
    }
}
