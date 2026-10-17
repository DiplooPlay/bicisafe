package pe.edu.untels.bicisafe.ruta.dto;

import pe.edu.untels.bicisafe.ruta.domain.Lugar;

/**
 * Public suggestion of a Lima place for the planner inputs.
 */
public record LugarResponse(String nombre, double lat, double lng) {

    public static LugarResponse desde(Lugar lugar) {
        return new LugarResponse(lugar.nombre(), lugar.punto().latitud(), lugar.punto().longitud());
    }
}
