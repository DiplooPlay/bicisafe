import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGeolocalizacion } from './useGeolocalizacion';

describe('useGeolocalizacion hook', () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true,
    });
  });

  it('obtiene coordenadas y precisión satelital alta cuando el navegador lo permite', async () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: -12.1217,
          longitude: -77.0298,
          accuracy: 15,
        },
      });
    });

    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocalizacion());

    expect(result.current.coords).toEqual([-12.1217, -77.0298]);
    expect(result.current.accuracy).toBe(15);
    expect(result.current.isHighAccuracy).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('maneja el rechazo de permisos con fallback y mensaje claro', async () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((_success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
        TIMEOUT: 3,
      });
    });

    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocalizacion());

    expect(result.current.coords).toEqual([-12.1217, -77.0298]);
    expect(result.current.accuracy).toBeNull();
    expect(result.current.error).toContain('Permiso de ubicación denegado');
  });
});
