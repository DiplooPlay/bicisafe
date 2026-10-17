import { useState, useEffect, useCallback } from 'react';

export interface GeolocalizacionState {
  coords: [number, number] | null;
  accuracy: number | null;
  isHighAccuracy: boolean;
  loading: boolean;
  error: string | null;
  obtenerUbicacion: () => void;
}

/**
 * Hook to request and track geolocation with high precision (A-GPS / WiFi deep triangulation).
 */
export function useGeolocalizacion(): GeolocalizacionState {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      setCoords([-12.1217, -77.0298]); // Miraflores fallback
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        setCoords([lat, lng]);
        setAccuracy(Math.round(acc));
        setLoading(false);
      },
      (err) => {
        let msg = 'No se pudo obtener tu ubicación precisa.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado. Se usa una ubicación de referencia en Lima.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Tiempo de espera agotado buscando señal GPS.';
        }
        setError(msg);
        setCoords([-12.1217, -77.0298]); // Miraflores fallback
        setAccuracy(null);
        setLoading(false);
      },
      {
        enableHighAccuracy: true, // Forces hardware GPS or deep WiFi triangulation
        timeout: 12000,          // 12s timeout for GPS fix
        maximumAge: 0            // Zero cache: get fresh satellites coordinates
      }
    );
  }, []);

  useEffect(() => {
    obtenerUbicacion();
  }, [obtenerUbicacion]);

  // Considered high accuracy if error margin is 50 meters or less
  const isHighAccuracy = accuracy !== null && accuracy <= 50;

  return {
    coords,
    accuracy,
    isHighAccuracy,
    loading,
    error,
    obtenerUbicacion
  };
}

export default useGeolocalizacion;
