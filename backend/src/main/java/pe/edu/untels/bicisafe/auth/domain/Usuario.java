package pe.edu.untels.bicisafe.auth.domain;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A BiciSafe cyclist account (JPA entity, never exposed outside the module: use DTOs).
 *
 * <p>Uses Hibernate's {@code @UuidGenerator} so new UUID ids are produced by the app,
 * not by the database.
 */
@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @UuidGenerator
    private UUID id;

    /** Normalized (trimmed, lowercase) email; unique per table and verified in the service. */
    @Column(nullable = false, unique = true)
    private String correo;

    @Column(name = "hash_password", nullable = false)
    private String hashPassword;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RolUsuario rol = RolUsuario.CICLISTA;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Setter(AccessLevel.NONE)
    private EstadoUsuario estado;

    @Column(name = "fecha_registro", nullable = false)
    @Setter(AccessLevel.NONE)
    private Instant fechaRegistro;

    @Column(name = "fecha_verificacion")
    @Setter(AccessLevel.NONE)
    private Instant fechaVerificacion;

    public static Usuario nuevoPendiente(String correo, String hashPassword, String nombre) {
        Usuario usuario = new Usuario();
        usuario.correo = correo;
        usuario.hashPassword = hashPassword;
        usuario.nombre = nombre;
        usuario.rol = RolUsuario.CICLISTA;
        usuario.estado = EstadoUsuario.PENDIENTE_VERIFICACION;
        return usuario;
    }

    /** Activates the account after the emailed verification link is confirmed. */
    public void activar() {
        this.estado = EstadoUsuario.ACTIVO;
        this.fechaVerificacion = Instant.now();
    }

    /** Marks the account as blocked (moderation case, handled by the admin module). */
    public void bloquear() {
        this.estado = EstadoUsuario.BLOQUEADO;
    }

    public boolean estaActivo() {
        return estado == EstadoUsuario.ACTIVO;
    }

    @PrePersist
    void marcarFechaRegistro() {
        if (fechaRegistro == null) {
            fechaRegistro = Instant.now();
        }
    }
}
