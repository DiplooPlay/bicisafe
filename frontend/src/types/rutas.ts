/**
 * TypeScript types shared by services and components for route planning (E2).
 */

/** A suggested place returned by GET /api/lugares. */
export interface LugarSugerido {
  nombre: string;
  lat: number;
  lng: number;
}

/** Data needed to plan a route through GET /api/rutas. */
export interface PuntosRuta {
  latOrigen: number;
  lngOrigen: number;
  latDestino: number;
  lngDestino: number;
}

/**
 * Bike route returned by the API.
 * `puntos` follows the Leaflet convention: [lat, lng] pairs ordered origin → destination.
 */
export interface RutaPlanificada {
  distanciaKm: number;
  duracionMin: number;
  puntos: [number, number][];
}
