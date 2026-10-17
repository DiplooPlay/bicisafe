/**
 * HTTP access to the places search endpoint (E2).
 */

import { peticionApi } from './api';
import type { LugarSugerido } from '../types/rutas';

/**
 * Searches Lima places matching free text; used by the planner suggestions.
 * Mirrors GET /api/lugares?texto=...
 */
export function buscarLugares(texto: string): Promise<LugarSugerido[]> {
  return peticionApi<LugarSugerido[]>({ path: `/api/lugares?texto=${encodeURIComponent(texto)}` });
}
