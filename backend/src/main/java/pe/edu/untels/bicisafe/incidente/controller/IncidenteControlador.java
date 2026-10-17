package pe.edu.untels.bicisafe.incidente.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteRequest;
import pe.edu.untels.bicisafe.incidente.dto.IncidenteResponse;
import pe.edu.untels.bicisafe.incidente.service.IncidenteService;

/**
 * REST controller for reporting, viewing, and voting on road incidents.
 */
@RestController
@RequestMapping("/api/incidentes")
public class IncidenteControlador {

    private final IncidenteService incidenteService;

    public IncidenteControlador(IncidenteService incidenteService) {
        this.incidenteService = incidenteService;
    }

    /**
     * Public endpoint to retrieve all active incidents to render on the map.
     */
    @GetMapping("/activos")
    public List<IncidenteResponse> listarActivos() {
        return incidenteService.listarActivos().stream()
                .map(IncidenteResponse::desde)
                .toList();
    }

    /**
     * Retrieves all incidents including disputed or history for the consensus feed.
     */
    @GetMapping
    public List<IncidenteResponse> listarTodos() {
        return incidenteService.listarTodos().stream()
                .map(IncidenteResponse::desde)
                .toList();
    }

    /**
     * Reports a new road incident.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenteResponse reportar(
            @Valid @RequestBody IncidenteRequest solicitud,
            Principal principal) {
        String nombreAutor = (principal != null) ? principal.getName() : "Ciclista Urbano";
        return IncidenteResponse.desde(incidenteService.reportarIncidente(solicitud, nombreAutor));
    }

    /**
     * Confirms an incident report (+1 community consensus vote).
     */
    @PostMapping("/{id}/confirmar")
    public IncidenteResponse confirmar(@PathVariable UUID id) {
        return IncidenteResponse.desde(incidenteService.confirmarIncidente(id));
    }

    /**
     * Marks an incident as resolved/cleared so it is removed from the active map.
     */
    @PostMapping("/{id}/resolver")
    public IncidenteResponse resolver(@PathVariable UUID id) {
        return IncidenteResponse.desde(incidenteService.resolverIncidente(id));
    }
}
