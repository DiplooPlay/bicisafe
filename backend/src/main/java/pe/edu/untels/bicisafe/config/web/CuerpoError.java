package pe.edu.untels.bicisafe.config.web;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * JSON body returned by the global exception handler.
 *
 * @param mensaje     user-facing error message (Spanish)
 * @param errores     per-field errors keyed by request field name, when applicable
 */
public record CuerpoError(String mensaje, Map<String, String> errores) {

    public static CuerpoError de(String mensaje) {
        return new CuerpoError(mensaje, null);
    }

    public static CuerpoError deCampo(String campo, String mensaje) {
        Map<String, String> errores = new LinkedHashMap<>();
        errores.put(campo, mensaje);
        return new CuerpoError(mensaje, errores);
    }
}
