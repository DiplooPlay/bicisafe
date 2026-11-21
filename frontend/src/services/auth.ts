/**
 * HTTP access to the auth endpoints (E1). Components never call fetch directly: they
 * go through this service.
 */

import { peticionApi } from './api';
import { mapDtoToIncident } from './incidenteService';
import type {
  DatosLogin,
  DatosRecuperarPassword,
  DatosRegistro,
  DatosRestablecerPassword,
  PerfilUsuario,
  RespuestaLogin,
  RespuestaMensaje,
  RespuestaRegistro,
  UsuarioSesion,
} from '../types/sesion';

interface PerfilUsuarioBackend {
  id: string;
  correo: string;
  nombre: string;
  rol: string;
  reputacion: number;
  totalReportes: number;
  fechaRegistro: string;
  historialReportes?: any[];
}

/** Registers a visitor and triggers the verification email. Mirrors POST /api/auth/registro. */
export function registrar(datos: DatosRegistro): Promise<RespuestaRegistro> {
  return peticionApi<RespuestaRegistro>({ path: '/api/auth/registro', method: 'POST', body: datos });
}

/** Confirms a verification token that came from the email link. Mirrors GET /api/auth/verificar. */
export function verificarCorreo(token: string): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: `/api/auth/verificar?token=${encodeURIComponent(token)}` });
}

/** Requests a password recovery email (HU-03). Mirrors POST /api/auth/recuperar-password. */
export function solicitarRecuperacionPassword(datos: DatosRecuperarPassword): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: '/api/auth/recuperar-password', method: 'POST', body: datos });
}

/** Resets password using a time-limited token (HU-03). Mirrors POST /api/auth/restablecer-password. */
export function restablecerPassword(datos: DatosRestablecerPassword): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: '/api/auth/restablecer-password', method: 'POST', body: datos });
}

/** Logs a cyclist in with email + password. Mirrors POST /api/auth/login. */
export function iniciarSesion(datos: DatosLogin): Promise<RespuestaLogin> {
  return peticionApi<RespuestaLogin>({ path: '/api/auth/login', method: 'POST', body: datos });
}

/** Returns the session owner with the given token. Mirrors GET /api/usuarios/me. */
export function obtenerPerfil(token: string): Promise<UsuarioSesion> {
  return peticionApi<UsuarioSesion>({ path: '/api/usuarios/me', token });
}

/** Returns the full profile with reputation and incident report history (HU-04). Mirrors GET /api/usuarios/perfil. */
export async function obtenerPerfilCompleto(token: string): Promise<PerfilUsuario> {
  const backend = await peticionApi<PerfilUsuarioBackend>({ path: '/api/usuarios/perfil', token });
  return {
    ...backend,
    historialReportes: (backend.historialReportes || []).map(mapDtoToIncident),
  };
}

/** Deletes the cyclist account (RNF-10). Mirrors DELETE /api/usuarios/me. */
export function eliminarCuentaApi(token: string): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: '/api/usuarios/me', method: 'DELETE', token });
}

/** Informs the backend to invalidate the JWT token in blacklist. Mirrors POST /api/auth/logout. */
export function cerrarSesionApi(token?: string): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: '/api/auth/logout', method: 'POST', token });
}

