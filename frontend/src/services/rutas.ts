/**
 * HTTP access to the route planning endpoint (E2).
 */

import { peticionApi } from './api';
import type { PuntosRuta, RutaPlanificada } from '../types/rutas';

interface RutaResponseBackend {
  distanciaKm: number;
  duracionMin: number;
  puntoRecorrido: [number, number][];
}

/**
 * Plans a bike route and returns distance, duration and the path geometry.
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
  };
}
