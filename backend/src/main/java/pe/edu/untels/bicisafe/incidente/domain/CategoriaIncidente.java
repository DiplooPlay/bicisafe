package pe.edu.untels.bicisafe.incidente.domain;

/**
 * Categories of road incidents reported by cyclists.
 */
public enum CategoriaIncidente {
    BACHE,
    OBRAS,
    BLOQUEO,
    ILUMINACION,
    OTRO;

    public static CategoriaIncidente fromString(String value) {
        if (value == null) {
            return OTRO;
        }
        try {
            return CategoriaIncidente.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return OTRO;
        }
    }
}
