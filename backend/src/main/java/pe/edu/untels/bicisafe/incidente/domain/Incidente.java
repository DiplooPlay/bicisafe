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

    @Column(name = "denuncias_falso", nullable = false)
    private int denunciasFalso = 0;

    @Column(name = "denuncias_duplicado", nullable = false)
    private int denunciasDuplicado = 0;

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
        actualizarEstadoConsenso();
        if (this.estado == EstadoIncidente.CONFIRMADO && this.fechaExpiracion != null) {
            this.fechaExpiracion = Instant.now().plus(6, ChronoUnit.HOURS);
        }
    }

    /**
     * Registers a vote marking incident as resolved/cleared. Reaching 3 votes approves it as RESUELTO.
     */
    public void marcarComoResuelto() {
        this.votosRechazar++;
        actualizarEstadoConsenso();
    }

    /**
     * Marks the incident as expired (HU-15).
     */
    public void marcarComoExpirado() {
        this.estado = EstadoIncidente.EXPIRADO;
    }

    /**
     * Flags an inappropriate incident as false or duplicate (HU-14).
     */
    public void registrarDenuncia(String motivo) {
        if ("DUPLICADO".equalsIgnoreCase(motivo)) {
            this.denunciasDuplicado++;
        } else {
            this.denunciasFalso++;
        }
        actualizarEstadoConsenso();
    }

    /**
     * Reglas de consenso comunitario:
     * - Si logra tener 3 votos de resuelto, se aprueba como RESUELTO y desaparece de las demás áreas.
     * - Si tiene al menos 3 validaciones y menos de 3 acusaciones: CONFIRMADO.
     * - Si no logra 3 validaciones y en su lugar tiene 3 acusaciones de falso: INVALIDO.
     * - Si ambos superan las 3 acusaciones/validaciones: va al más votado.
     * - Si ambos superan las 3 y están en empate: EN_DISPUTA.
     * - Si ninguno alcanza las 3: PENDIENTE.
     */
    public void actualizarEstadoConsenso() {
        if (this.estado == EstadoIncidente.EXPIRADO) {
            return;
        }

        if (this.votosRechazar >= 3) {
            this.estado = EstadoIncidente.RESUELTO;
            return;
        }

        int confirmaciones = this.votosConfirmar;
        int acusaciones = this.denunciasFalso + this.denunciasDuplicado;

        boolean confirmaAlcanzado = confirmaciones >= 3;
        boolean acusacionAlcanzado = acusaciones >= 3;

        if (confirmaAlcanzado && acusacionAlcanzado) {
            if (confirmaciones > acusaciones) {
                this.estado = EstadoIncidente.CONFIRMADO;
            } else if (acusaciones > confirmaciones) {
                this.estado = EstadoIncidente.INVALIDO;
            } else {
                this.estado = EstadoIncidente.EN_DISPUTA;
            }
        } else if (confirmaAlcanzado) {
            this.estado = EstadoIncidente.CONFIRMADO;
        } else if (acusacionAlcanzado) {
            this.estado = EstadoIncidente.INVALIDO;
        } else {
            this.estado = EstadoIncidente.PENDIENTE;
        }
    }

    public boolean estaActivo() {
        return this.estado != EstadoIncidente.RESUELTO
                && this.estado != EstadoIncidente.INVALIDO
                && this.estado != EstadoIncidente.EXPIRADO
                && (this.fechaExpiracion == null || Instant.now().isBefore(this.fechaExpiracion));
    }
}
