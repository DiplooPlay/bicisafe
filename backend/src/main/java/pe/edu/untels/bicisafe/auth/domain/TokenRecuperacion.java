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
 * Single-use token sent by email to reset a {@link Usuario} password (HU-03).
 *
 * <p>Valid for a limited time (15 minutes).
 */
@Entity
@Table(name = "token_recuperacion")
@Getter
@Setter
@NoArgsConstructor
public class TokenRecuperacion {

    public static final Duration VIGENCIA_POR_DEFECTO = Duration.ofMinutes(15);

    @Id
    @UuidGenerator
    private UUID id;

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

    public static TokenRecuperacion generar(Usuario usuario) {
        TokenRecuperacion tokenRecuperacion = new TokenRecuperacion();
        tokenRecuperacion.token = UUID.randomUUID().toString();
        tokenRecuperacion.usuario = usuario;
        tokenRecuperacion.fechaExpiracion = Instant.now().plus(VIGENCIA_POR_DEFECTO);
        return tokenRecuperacion;
    }

    public boolean haExpirado(Instant ahora) {
        return ahora.isAfter(fechaExpiracion);
    }

    public void marcarUsado(Instant ahora) {
        this.fechaUso = ahora;
    }

    public boolean estaUsado() {
        return fechaUso != null;
    }
}
