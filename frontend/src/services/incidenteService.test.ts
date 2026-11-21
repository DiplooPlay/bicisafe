import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchIncidentesActivos, fetchIncidentesEnRuta } from './incidenteService';

describe('incidenteService', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('normaliza estados en español desde el backend a los estados esperados por el frontend (HU-09, HU-14, HU-15)', async () => {
    const mockBackendResponse = [
      { id: '1', estado: 'PENDIENTE', categoria: 'bache', titulo: 'Bache' },
      { id: '2', estado: 'EN_DISPUTA', categoria: 'obras', titulo: 'Obras' },
      { id: '3', estado: 'CONFIRMADO', categoria: 'bloqueo', titulo: 'Bloqueo' },
      { id: '4', estado: 'EXPIRADO', categoria: 'otro', titulo: 'Expirado' },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    } as any);

    const incidentes = await fetchIncidentesActivos();

    expect(incidentes).toHaveLength(4);
    expect(incidentes[0].status).toBe('PENDING');
    expect(incidentes[1].status).toBe('DISPUTED');
    expect(incidentes[2].status).toBe('CONFIRMED');
    expect(incidentes[3].status).toBe('EXPIRED');
  });

  it('filtra incidentes cercanos a la ruta en modo fallback resiliente (HU-09)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Route near Miraflores (where inc-1 is at -12.1050, -77.0315)
    const puntosRuta: [number, number][] = [
      [-12.1049, -77.0314],
      [-12.1051, -77.0316],
    ];

    const incidentes = await fetchIncidentesEnRuta(puntosRuta, 150);

    expect(incidentes.some(i => i.id === 'inc-1')).toBe(true);
    // Incidents far away shouldn't match
    expect(incidentes.every(i => i.status !== 'RESOLVED' && i.status !== 'EXPIRED')).toBe(true);
  });

  it('denunciarIncidenteApi rechaza la promesa con mensaje de error ante respuesta HTTP 400 (HU-14)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ mensaje: 'Ya has denunciado este incidente anteriormente' }),
    } as any);

    await expect(
      import('./incidenteService').then(m => m.denunciarIncidenteApi('inc-123', 'DUPLICADO', 'Comentario de prueba'))
    ).rejects.toThrow('Ya has denunciado este incidente anteriormente');
  });
});
