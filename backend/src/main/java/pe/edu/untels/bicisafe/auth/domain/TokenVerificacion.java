package pe.edu.untels.bicisafe.auth.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Single-use token sent by email to activate a {@link Usuario} account.
 *
 * <p>The raw token is stored so the emailed link can be replayed exactly once;
 * tokens are unpredictable (random UUIDv4) and expire.
 */
@Entity
@Table(name = "token_verificacion")
@Getter
@Setter
@NoArgsConstructor
public class TokenVerificacion {

    public static final Duration VIGENCIA_POR_DEFECTO = Duration.ofHours(24);

    @Id
    @UuidGenerator
    private UUID id;

    /** Raw token value carried in the email link. */
    @Column(nullable = false, unique = true, length = 36)
    @Setter(AccessLevel.NONE)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_expiracion", nullable = false)
    private Instant fechaExpiracion;

    @Column(name = "fecha_uso")
    @Setter(AccessLevel.NONE)
    private Instant fechaUso;

    public static TokenVerificacion generar(Usuario usuario) {
        TokenVerificacion tokenVerificacion = new TokenVerificacion();
        tokenVerificacion.token = UUID.randomUUID().toString();
        tokenVerificacion.usuario = usuario;
        tokenVerificacion.fechaExpiracion = Instant.now().plus(VIGENCIA_POR_DEFECTO);
        return tokenVerificacion;
    }

    public boolean haExpirado(Instant ahora) {
        return ahora.isAfter(fechaExpiracion);
    }

    /** Marks the token as consumed; a used token can never confirm again. */
    public void marcarUsado(Instant ahora) {
        this.fechaUso = ahora;
    }

    public boolean estaUsado() {
        return fechaUso != null;
    }
}
