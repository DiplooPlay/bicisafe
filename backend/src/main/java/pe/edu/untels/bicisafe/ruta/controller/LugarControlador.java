package pe.edu.untels.bicisafe.ruta.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.untels.bicisafe.ruta.dto.LugarResponse;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutas;

/**
 * E2 endpoint for the location search story. Public: visitors can look up Lima places.
 */
@RestController
@RequestMapping("/api/lugares")
public class LugarControlador {

    private final ServicioRutas servicioRutas;

    public LugarControlador(ServicioRutas servicioRutas) {
        this.servicioRutas = servicioRutas;
    }

    @GetMapping
    public List<LugarResponse> buscar(@RequestParam("texto") String texto) {
        return servicioRutas.buscarLugares(texto).stream()
                .map(LugarResponse::desde)
                .toList();
    }
}
