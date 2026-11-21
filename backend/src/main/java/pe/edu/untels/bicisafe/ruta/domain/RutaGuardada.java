package pe.edu.untels.bicisafe.ruta.domain;

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
 * Cyclist saved route for fast retrieval without recalculating (HU-16).
 */
@Entity
@Table(name = "ruta_guardada")
@Getter
@Setter
@NoArgsConstructor
public class RutaGuardada {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "origen_nombre", length = 150)
    private String origenNombre;

    @Column(name = "destino_nombre", length = 150)
    private String destinoNombre;

    @Column(name = "lat_origen", nullable = false)
    private double latOrigen;

    @Column(name = "lng_origen", nullable = false)
    private double lngOrigen;

    @Column(name = "lat_destino", nullable = false)
    private double latDestino;

    @Column(name = "lng_destino", nullable = false)
    private double lngDestino;

    @Column(name = "distancia_km", nullable = false)
    private double distanciaKm;

    @Column(name = "duracion_min", nullable = false)
    private long duracionMin;

    @Column(name = "geometria_json", nullable = false, columnDefinition = "TEXT")
    private String geometriaJson;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion;

    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = Instant.now();
        }
    }
}
