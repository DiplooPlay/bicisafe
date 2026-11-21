package pe.edu.untels.bicisafe.ruta.dto;

import java.util.UUID;

/**
 * Representation of a user with a saved route passing near an incident (HU-17).
 */
public record UsuarioRutaAfectada(UUID usuarioId, String correo, String nombre, String nombreRuta) {
}
