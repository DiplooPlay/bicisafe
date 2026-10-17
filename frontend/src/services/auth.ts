/**
 * HTTP access to the auth endpoints (E1). Components never call fetch directly: they
 * go through this service.
 */

import { peticionApi } from './api';
import type {
  DatosLogin,
  DatosRegistro,
  RespuestaLogin,
  RespuestaMensaje,
  RespuestaRegistro,
  UsuarioSesion,
} from '../types/sesion';

/** Registers a visitor and triggers the verification email. Mirrors POST /api/auth/registro. */
export function registrar(datos: DatosRegistro): Promise<RespuestaRegistro> {
  return peticionApi<RespuestaRegistro>({ path: '/api/auth/registro', method: 'POST', body: datos });
}

/** Confirms a verification token that came from the email link. Mirrors GET /api/auth/verificar. */
export function verificarCorreo(token: string): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: `/api/auth/verificar?token=${encodeURIComponent(token)}` });
}

/** Logs a cyclist in with email + password. Mirrors POST /api/auth/login. */
export function iniciarSesion(datos: DatosLogin): Promise<RespuestaLogin> {
  return peticionApi<RespuestaLogin>({ path: '/api/auth/login', method: 'POST', body: datos });
}

/** Returns the session owner with the given token. Mirrors GET /api/usuarios/me. */
export function obtenerPerfil(token: string): Promise<UsuarioSesion> {
  return peticionApi<UsuarioSesion>({ path: '/api/usuarios/me', token });
}

/** Informs the backend to invalidate the JWT token in blacklist. Mirrors POST /api/auth/logout. */
export function cerrarSesionApi(token?: string): Promise<RespuestaMensaje> {
  return peticionApi<RespuestaMensaje>({ path: '/api/auth/logout', method: 'POST', token });
}

