import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buscarLugares } from './lugares';
import * as api from './api';

describe('buscarLugares', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('llama al endpoint de lugares con el texto codificado y devuelve los resultados', async () => {
    const lugaresMock = [
      {
        nombre: 'Parque Kennedy, Miraflores, Lima',
        lat: -12.1217,
        lng: -77.0297
      }
    ];

    const peticionSpy = vi.spyOn(api, 'peticionApi').mockResolvedValue(lugaresMock);

    const resultado = await buscarLugares('Parque Kennedy');

    expect(peticionSpy).toHaveBeenCalledWith({
      path: '/api/lugares?texto=Parque%20Kennedy'
    });
    expect(resultado).toEqual(lugaresMock);
  });
});
