package pe.edu.untels.bicisafe.incidente.domain;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Incident reported by cyclists on urban bike lanes.
 */
@Entity
@Table(name = "incidente")
@Getter
@Setter
@NoArgsConstructor
public class Incidente {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoriaIncidente categoria;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 120)
    private String descripcion;

    @Column(name = "ubicacion_texto", nullable = false, length = 200)
    private String ubicacionTexto;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "autor_nombre", nullable = false, length = 120)
    private String autorNombre;

    @Column(name = "autor_reputacion", nullable = false)
    private int autorReputacion = 15;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoIncidente estado = EstadoIncidente.PENDIENTE;

    @Column(name = "votos_confirmar", nullable = false)
    private int votosConfirmar = 1;

    @Column(name = "votos_rechazar", nullable = false)
    private int votosRechazar = 0;

    @Column(name = "votos_requeridos", nullable = false)
    private int votosRequeridos = 3;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion;

    @Column(name = "fecha_expiracion", nullable = false)
    private Instant fechaExpiracion;

    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = Instant.now();
        }
        if (fechaExpiracion == null) {
            fechaExpiracion = fechaCreacion.plus(2, ChronoUnit.HOURS);
        }
    }

    /**
     * Confirms the incident (+1 vote). If required threshold is reached, advances state to CONFIRMADO.
     */
    public void registrarConfirmacion() {
        this.votosConfirmar++;
        if (this.votosConfirmar >= this.votosRequeridos) {
            this.estado = EstadoIncidente.CONFIRMADO;
        } else if (this.votosRechazar > 0 && this.votosConfirmar == this.votosRechazar) {
            this.estado = EstadoIncidente.EN_DISPUTA;
        }
    }

    /**
     * Rejects or marks incident as resolved/cleared.
     */
    public void marcarComoResuelto() {
        this.votosRechazar++;
        this.estado = EstadoIncidente.RESUELTO;
    }

    public boolean estaActivo() {
        return this.estado != EstadoIncidente.RESUELTO && Instant.now().isBefore(this.fechaExpiracion);
    }
}
