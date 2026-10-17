import React, { useRef, useState } from 'react';
import { calcularRuta } from '../../services/rutas';
import { buscarLugares } from '../../services/lugares';
import { ApiError } from '../../services/api';
import { LugarSugerido, RutaPlanificada } from '../../types/rutas';

interface PlanificadorRutaProps {
  onRouteCalculated: (route: RutaPlanificada | null) => void;
  onRoutingError: (errorMsg: string | null) => void;
  userCoords: [number, number] | null;
  onUseCurrentLocation: () => void;
}

interface EntradaLugar {
  /** Text shown in the input; empty when the user typed their own search. */
  texto: string;
  /** Coordinates of the selected suggestion, if any. */
  coords: [number, number] | null;
}

const ENTRADA_VACIA: EntradaLugar = { texto: '', coords: null };

/**
 * E2 route planner: place search (with suggestions) for origin/destination, use of the
 * current GPS location and the call to the routing service.
 */
export const PlanificadorRuta: React.FC<PlanificadorRutaProps> = ({
  onRouteCalculated,
  onRoutingError,
  userCoords,
  onUseCurrentLocation
}) => {
  const [origen, setOrigen] = useState<EntradaLugar>(ENTRADA_VACIA);
  const [destino, setDestino] = useState<EntradaLugar>(ENTRADA_VACIA);
  const [sugerencias, setSugerencias] = useState<{ campo: 'origen' | 'destino' | null; lugares: LugarSugerido[] }>({
    campo: null,
    lugares: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RutaPlanificada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ultimoBusqueda = useRef<{ campo: 'origen' | 'destino' | null; texto: string }>({ campo: null, texto: '' });
  const timerBusqueda = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
    setOrigen({ texto: 'Mi ubicación actual (GPS)', coords: userCoords });
  };

  /**
   * Debounced place search while typing (300ms); suggestions only ask the API from 3+ chars,
   * matching what the backend accepts and respecting Nominatim's rate limits.
   */
  const buscarSugerencias = (campo: 'origen' | 'destino', texto: string) => {
    if (timerBusqueda.current) {
      clearTimeout(timerBusqueda.current);
    }
    const limpio = texto.trim();
    if (limpio.length < 3) {
      setSugerencias({ campo: null, lugares: [] });
      setIsSearching(false);
      return;
    }
    ultimoBusqueda.current = { campo, texto };
    setIsSearching(true);
    timerBusqueda.current = setTimeout(() => {
      buscarLugares(limpio)
        .then((lugares) => {
          // Show results only if they belong to the latest search (avoids flicker).
          if (ultimoBusqueda.current.campo === campo && ultimoBusqueda.current.texto === texto) {
            setSugerencias({ campo, lugares });
          }
        })
        .catch(() => setSugerencias({ campo, lugares: [] }))
        .finally(() => setIsSearching(false));
    }, 300);
  };

  const seleccionarSugerencia = (campo: 'origen' | 'destino', lugar: LugarSugerido) => {
    const entrada: EntradaLugar = { texto: lugar.nombre, coords: [lugar.lat, lugar.lng] };
    if (campo === 'origen') {
      setOrigen(entrada);
    } else {
      setDestino(entrada);
    }
    setSugerencias({ campo: null, lugares: [] });
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onRoutingError(null);

    let coordsOrigen = origen.coords;
    let coordsDestino = destino.coords;

    // Si el usuario escribió texto pero no hizo clic en el desplegable,
    // buscamos automáticamente las coordenadas del primer resultado:
    if (!coordsOrigen && origen.texto.trim().length >= 3) {
      setIsSearching(true);
      try {
        const lugares = await buscarLugares(origen.texto.trim());
        if (lugares.length > 0) {
          coordsOrigen = [lugares[0].lat, lugares[0].lng];
          setOrigen({ texto: lugares[0].nombre, coords: coordsOrigen });
        }
      } catch {
        // Validación posterior informará el error
      } finally {
        setIsSearching(false);
      }
    }

    if (!coordsDestino && destino.texto.trim().length >= 3) {
      setIsSearching(true);
      try {
        const lugares = await buscarLugares(destino.texto.trim());
        if (lugares.length > 0) {
          coordsDestino = [lugares[0].lat, lugares[0].lng];
          setDestino({ texto: lugares[0].nombre, coords: coordsDestino });
        }
      } catch {
        // Validación posterior informará el error
      } finally {
        setIsSearching(false);
      }
    }

    if (!coordsOrigen) {
      setError('Selecciona un origen de las sugerencias o usa tu ubicación actual.');
      return;
    }
    if (!coordsDestino) {
      setError('No se encontró el destino en Lima. Elige una de las sugerencias de búsqueda.');
      return;
    }

    setIsCalculating(true);
    try {
      const route = await calcularRuta({
        latOrigen: coordsOrigen[0],
        lngOrigen: coordsOrigen[1],
        latDestino: coordsDestino[0],
        lngDestino: coordsDestino[1]
      });
      setActiveRoute(route);
      onRouteCalculated(route);
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'Error al calcular la ruta. Intenta de nuevo.';
      setActiveRoute(null);
      onRouteCalculated(null);
      onRoutingError(mensaje);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    onRouteCalculated(null);
    onRoutingError(null);
  };

  const mostrarSugerencias = (campo: 'origen' | 'destino') =>
    sugerencias.campo === campo && sugerencias.lugares.length > 0;

  const inputClass =
    'w-full h-10 pl-9 pr-3 bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm rounded-xl outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-transparent focus:border-primary/20';

  const renderCampo = (campo: 'origen' | 'destino') => {
    const esOrigen = campo === 'origen';
    const entrada = esOrigen ? origen : destino;
    return (
      <div className="relative">
        <div className={esOrigen ? '' : 'mt-3'}>
          <div className="flex items-center justify-between mb-1">
            <label className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
              {esOrigen ? 'Origen (lugar o dirección en Lima)' : 'Destino (lugar o dirección en Lima)'}
            </label>
            {esOrigen && (
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="font-label-sm text-[11px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                <span>Usar mi GPS</span>
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <span
              className={`material-symbols-outlined absolute left-3 text-[18px] ${esOrigen ? 'text-primary' : 'text-error'}`}
            >
              {esOrigen ? 'trip_origin' : 'location_on'}
            </span>
            <input
              type="text"
              required
              value={entrada.texto}
              onChange={(e) => {
                const texto = e.target.value;
                if (esOrigen) {
                  setOrigen({ texto, coords: texto === 'Mi ubicación actual (GPS)' ? userCoords : null });
                } else {
                  setDestino({ texto, coords: null });
                }
                buscarSugerencias(campo, texto);
              }}
              onBlur={() => setTimeout(() => setSugerencias((prev) => ({ ...prev, campo: null })), 250)}
              onFocus={() => {
                if (entrada.texto.trim().length >= 3) {
                  buscarSugerencias(campo, entrada.texto);
                }
              }}
              placeholder={esOrigen ? 'Ej. Parque Kennedy, Av. Arequipa...' : 'Ej. UNTELS, Ovalo Higuereta...'}
              className={inputClass}
            />
            {isSearching && sugerencias.campo === campo && (
              <span className="absolute right-3 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            )}
          </div>
        </div>

        {mostrarSugerencias(campo) && (
          <ul className="absolute z-40 left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 max-h-56 overflow-y-auto">
            {sugerencias.lugares.map((lugar) => (
              <li key={`${lugar.lat}-${lugar.lng}-${lugar.nombre}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => seleccionarSugerencia(campo, lugar)}
                  className="w-full text-left px-3 py-2.5 hover:bg-surface-container flex items-start gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline mt-0.5">place</span>
                  <span className="font-body-sm text-xs text-on-surface line-clamp-2">{lugar.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {sugerencias.campo === campo && !isSearching && entrada.texto.trim().length >= 3 && sugerencias.lugares.length === 0 && (
          <div className="absolute z-40 left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 p-3 text-center text-xs text-on-surface-variant">
            No se encontraron lugares en Lima para &quot;{entrada.texto.trim()}&quot;
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-lg border border-outline-variant/30 p-4 sm:p-5 w-full max-w-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
              Planificar Ruta Segura
            </h2>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              Lima Metropolitana y vías ciclistas
            </p>
          </div>
        </div>

        {activeRoute && (
          <button
            onClick={handleClearRoute}
            className="text-xs text-outline hover:text-error transition-colors p-1"
            title="Limpiar ruta"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleCalculate} className="mt-3.5 space-y-3">
        {renderCampo('origen')}

        <div className="relative">
          {renderCampo('destino')}
        </div>

        {/* Action Button */}
        <div className="pt-1 flex flex-col gap-2">
          <button
            type="submit"
            disabled={isCalculating}
            className="w-full h-10 bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs sm:text-sm font-semibold rounded-full shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-70"
          >
            {isCalculating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Calculando trayecto...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">directions_bike</span>
                <span>Calcular Ruta</span>
              </>
            )}
          </button>

          {error && (
            <p className="text-[11px] text-error flex items-center gap-1 px-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </p>
          )}
        </div>
      </form>

      {/* Summary Card (If route calculated) */}
      {activeRoute && (
        <div className="mt-4 pt-3.5 border-t border-surface-container flex flex-col gap-2.5 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-xl p-2.5 text-center">
            <div>
              <span className="text-[10px] uppercase text-outline tracking-wider block">Distancia total</span>
              <span className="font-metric-val text-base sm:text-lg font-bold text-on-surface">
                {activeRoute.distanciaKm} km
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-outline tracking-wider block">Tiempo estimado</span>
              <span className="font-metric-val text-base sm:text-lg font-bold text-primary">
                ~{activeRoute.duracionMin} min
              </span>
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">directions_bike</span>
            <span>Ruta calculada para bicicleta (perfil cycling)</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanificadorRuta;
