package pe.edu.untels.bicisafe.incidente.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "incidente_voto")
public class IncidenteVoto {

    @Id
    private UUID id;

    @Column(name = "incidente_id", nullable = false)
    private UUID incidenteId;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "votante_id", nullable = false, length = 100)
    private String votanteId;

    @Column(name = "tipo_voto", nullable = false, length = 20)
    private String tipoVoto;

    @Column(name = "fecha_voto", nullable = false)
    private Instant fechaVoto;

    public IncidenteVoto() {
    }

    public IncidenteVoto(UUID id, UUID incidenteId, UUID usuarioId, String votanteId, String tipoVoto, Instant fechaVoto) {
        this.id = id;
        this.incidenteId = incidenteId;
        this.usuarioId = usuarioId;
        this.votanteId = votanteId;
        this.tipoVoto = tipoVoto;
        this.fechaVoto = fechaVoto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getIncidenteId() {
        return incidenteId;
    }

    public void setIncidenteId(UUID incidenteId) {
        this.incidenteId = incidenteId;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getVotanteId() {
        return votanteId;
    }

    public void setVotanteId(String votanteId) {
        this.votanteId = votanteId;
    }

    public String getTipoVoto() {
        return tipoVoto;
    }

    public void setTipoVoto(String tipoVoto) {
        this.tipoVoto = tipoVoto;
    }

    public Instant getFechaVoto() {
        return fechaVoto;
    }

    public void setFechaVoto(Instant fechaVoto) {
        this.fechaVoto = fechaVoto;
    }
}
