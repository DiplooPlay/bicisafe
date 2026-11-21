/**
 * HTTP access to the route planning endpoint (E2).
 */

import { peticionApi } from './api';
import type { PuntoElevacion, PuntosRuta, RutaGuardada, RutaPlanificada } from '../types/rutas';

interface RutaResponseBackend {
  distanciaKm: number;
  duracionMin: number;
  puntoRecorrido: [number, number][];
  elevacionGanadaMetros?: number;
  elevacionPerdidaMetros?: number;
  perfilElevacion?: PuntoElevacion[];
}

/**
 * Plans a bike route and returns distance, duration, path geometry and elevation profile (HU-08).
 * Mirrors GET /api/rutas?latOrigen=...
 */
export async function calcularRuta(puntos: PuntosRuta): Promise<RutaPlanificada> {
  const query = new URLSearchParams({
    latOrigen: puntos.latOrigen.toString(),
    lngOrigen: puntos.lngOrigen.toString(),
    latDestino: puntos.latDestino.toString(),
    lngDestino: puntos.lngDestino.toString(),
  });
  const respuesta = await peticionApi<RutaResponseBackend>({ path: `/api/rutas?${query}` });
  return {
    distanciaKm: respuesta.distanciaKm,
    duracionMin: respuesta.duracionMin,
    puntos: respuesta.puntoRecorrido,
    elevacionGanadaMetros: respuesta.elevacionGanadaMetros,
    elevacionPerdidaMetros: respuesta.elevacionPerdidaMetros,
    perfilElevacion: respuesta.perfilElevacion,
  };
}

/** Saves a frequent route for quick access without recalculation (HU-16). */
export function guardarRutaApi(
  datos: {
    nombre: string;
    origenNombre?: string;
    destinoNombre?: string;
    latOrigen: number;
    lngOrigen: number;
    latDestino: number;
    lngDestino: number;
    distanciaKm: number;
    duracionMin: number;
    puntos: [number, number][];
  },
  token: string
): Promise<RutaGuardada> {
  return peticionApi<RutaGuardada>({
    path: '/api/rutas/guardadas',
    method: 'POST',
    body: datos,
    token,
  });
}

/** Lists the user's saved frequent routes (HU-16). */
export function listarRutasGuardadasApi(token: string): Promise<RutaGuardada[]> {
  return peticionApi<RutaGuardada[]>({
    path: '/api/rutas/guardadas',
    token,
  });
}

/** Deletes a saved frequent route (HU-16). */
export function eliminarRutaGuardadaApi(id: string, token: string): Promise<{ mensaje: string }> {
  return peticionApi<{ mensaje: string }>({
    path: `/api/rutas/guardadas/${id}`,
    method: 'DELETE',
    token,
  });
}
