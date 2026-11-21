package pe.edu.untels.bicisafe.incidente.domain;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Report/flag of an inappropriate, fake or duplicate incident (HU-14).
 */
@Entity
@Table(name = "incidente_denuncia")
@Getter
@Setter
@NoArgsConstructor
public class IncidenteDenuncia {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "incidente_id", nullable = false)
    private UUID incidenteId;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(nullable = false, length = 50)
    private String motivo;

    @Column(length = 200)
    private String comentario;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion;

    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = Instant.now();
        }
    }
}
