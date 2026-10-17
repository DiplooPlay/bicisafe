/**
 * TypeScript types shared by services, hooks and components for the session (E1).
 */

export type RolUsuario = 'CICLISTA' | 'ADMIN';

export type EstadoUsuario = 'PENDIENTE_VERIFICACION' | 'ACTIVO' | 'BLOQUEADO';

/** Cyclist data returned by the API (never includes the password). */
export interface UsuarioSesion {
  id: string;
  correo: string;
  nombre: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}

/** Payload sent to POST /api/auth/registro. */
export interface DatosRegistro {
  correo: string;
  password: string;
  nombre: string;
}

/** Payload sent to POST /api/auth/login. */
export interface DatosLogin {
  correo: string;
  password: string;
}

/** Response of POST /api/auth/registro. */
export interface RespuestaRegistro {
  mensaje: string;
}

/** Response of POST /api/auth/login. */
export interface RespuestaLogin {
  token: string;
  tipoToken: string;
  expiracionMinutos: number;
  usuario: UsuarioSesion;
}

/** Response of POST /api/auth/registro / GET /api/auth/verificar. */
export interface RespuestaMensaje {
  mensaje: string;
}
