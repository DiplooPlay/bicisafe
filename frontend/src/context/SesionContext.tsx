/**
 * Session state for E1: login, registration, email verification and logout.
 *
 * The JWT lives in localStorage so the session stays active while the user navigates
 * (and even across reloads); on startup the saved token is validated against the API.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  cerrarSesionApi,
  iniciarSesion as iniciarSesionEnApi,
  obtenerPerfil,
  registrar as registrarEnApi,
  verificarCorreo as verificarCorreoEnApi,
} from '../services/auth';
import type {
  DatosLogin,
  DatosRegistro,
  RespuestaMensaje,
  RespuestaRegistro,
  UsuarioSesion,
} from '../types/sesion';

const CLAVE_TOKEN = 'bicisafe.token';
const CLAVE_USUARIO = 'bicisafe.usuario';

interface EstadoSesion {
  /** Session owner, or null when the user is browsing as a visitor. */
  usuario: UsuarioSesion | null;
  /** True once the persisted token has been checked against the API. */
  inicializado: boolean;
  /** True while an auth request is in flight (buttons disable accordingly). */
  cargando: boolean;
  /** True only while the persisted token is being restored. */
  restaurando: boolean;
  registrar(datos: DatosRegistro): Promise<RespuestaRegistro>;
  iniciarSesion(datos: DatosLogin): Promise<UsuarioSesion>;
  verificarCorreoConfirmacion(token: string): Promise<RespuestaMensaje>;
  cerrarSesion(): void;
}

const ContextoSesion = createContext<EstadoSesion | null>(null);

export const ProveedorSesion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [inicializado, setInicializado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [restaurando, setRestaurando] = useState(true);

  // Restore the session while navigating: keep it if the token is still valid,
  // drop it silently when the API says it expired.
  useEffect(() => {
    const token = localStorage.getItem(CLAVE_TOKEN);
    const usuarioGuardado = localStorage.getItem(CLAVE_USUARIO);
    if (!token) {
      setRestaurando(false);
      setInicializado(true);
      return;
    }
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado) as UsuarioSesion);
    }
    obtenerPerfil(token)
      .then((usuarioValido) => {
        setUsuario(usuarioValido);
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuarioValido));
      })
      .catch(() => {
        // 401 or network error: nothing guarantees a valid session anymore.
        localStorage.removeItem(CLAVE_TOKEN);
        localStorage.removeItem(CLAVE_USUARIO);
        setUsuario(null);
      })
      .finally(() => {
        setRestaurando(false);
        setInicializado(true);
      });
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    setCargando(true);
    try {
      return await registrarEnApi(datos);
    } finally {
      setCargando(false);
    }
  }, []);

  const iniciarSesion = useCallback(async (datos: DatosLogin) => {
    setCargando(true);
    try {
      const respuesta = await iniciarSesionEnApi(datos);
      // Store the session first: after this point the user is authenticated.
      localStorage.setItem(CLAVE_TOKEN, respuesta.token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
      setUsuario(respuesta.usuario);
      return respuesta.usuario;
    } finally {
      setCargando(false);
    }
  }, []);

  const verificarCorreoConfirmacion = useCallback(async (token: string) => {
    setCargando(true);
    try {
      return await verificarCorreoEnApi(token);
    } finally {
      setCargando(false);
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    const token = localStorage.getItem(CLAVE_TOKEN);
    if (token) {
      cerrarSesionApi(token).catch(() => {});
    }
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    setUsuario(null);
  }, []);

  return (
    <ContextoSesion.Provider
      value={{
        usuario,
        inicializado,
        cargando,
        restaurando,
        registrar,
        iniciarSesion,
        verificarCorreoConfirmacion,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoSesion.Provider>
  );
};

/** React hook exposing the session state to components (single source of truth). */
export function useSesion(): EstadoSesion {
  const contexto = useContext(ContextoSesion);
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de ProveedorSesion.');
  }
  return contexto;
}
