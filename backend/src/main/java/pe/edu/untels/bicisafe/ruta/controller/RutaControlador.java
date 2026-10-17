package pe.edu.untels.bicisafe.ruta.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.untels.bicisafe.ruta.domain.Punto;
import pe.edu.untels.bicisafe.ruta.dto.RutaResponse;
import pe.edu.untels.bicisafe.ruta.service.ServicioRutas;

/**
 * E2 endpoint for the route planning story. Public: visitors can plan routes too.
 */
@RestController
@RequestMapping("/api/rutas")
public class RutaControlador {

    private final ServicioRutas servicioRutas;

    public RutaControlador(ServicioRutas servicioRutas) {
        this.servicioRutas = servicioRutas;
    }

    /**
     * Plans a bike route and returns distance, duration and the path geometry.
     *
     * @param latOrigen origin latitude
     * @param lngOrigen origin longitude
     * @param latDestino destination latitude
     * @param lngDestino destination longitude
     */
    @GetMapping
    public RutaResponse planificar(
            @RequestParam double latOrigen,
            @RequestParam double lngOrigen,
            @RequestParam double latDestino,
            @RequestParam double lngDestino) {
        return RutaResponse.desde(servicioRutas.planificarRuta(
                Punto.de(latOrigen, lngOrigen),
                Punto.de(latDestino, lngDestino)));
    }
}
