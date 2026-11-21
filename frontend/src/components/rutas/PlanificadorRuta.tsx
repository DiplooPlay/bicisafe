import React, { useRef, useState, useEffect } from 'react';
import { calcularRuta, guardarRutaApi, listarRutasGuardadasApi, eliminarRutaGuardadaApi } from '../../services/rutas';
import { buscarLugares } from '../../services/lugares';
import { fetchIncidentesEnRuta } from '../../services/incidenteService';
import { ApiError } from '../../services/api';
import { LugarSugerido, RutaGuardada, RutaPlanificada } from '../../types/rutas';
import { Incident } from '../../types';
import { useSesion } from '../../hooks/useSesion';
import PerfilElevacion from './PerfilElevacion';

interface PlanificadorRutaProps {
  onRouteCalculated: (route: RutaPlanificada | null) => void;
  onRoutingError: (errorMsg: string | null) => void;
  userCoords: [number, number] | null;
  onUseCurrentLocation: () => void;
  onFilterIncidentsOnRoute?: (incidents: Incident[] | null) => void;
}

interface EntradaLugar {
  texto: string;
  coords: [number, number] | null;
}

const ENTRADA_VACIA: EntradaLugar = { texto: '', coords: null };

export const PlanificadorRuta: React.FC<PlanificadorRutaProps> = ({
  onRouteCalculated,
  onRoutingError,
  userCoords,
  onUseCurrentLocation,
  onFilterIncidentsOnRoute,
}) => {
  const { usuario, token } = useSesion();
  const [tabActual, setTabActual] = useState<'planificar' | 'guardadas'>('planificar');
  const [origen, setOrigen] = useState<EntradaLugar>(ENTRADA_VACIA);
  const [destino, setDestino] = useState<EntradaLugar>(ENTRADA_VACIA);
  const [sugerencias, setSugerencias] = useState<{ campo: 'origen' | 'destino' | null; lugares: LugarSugerido[] }>({
    campo: null,
    lugares: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RutaPlanificada | null>(null);
  const [routeIncidents, setRouteIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Saved routes state (HU-16)
  const [rutasGuardadas, setRutasGuardadas] = useState<RutaGuardada[]>([]);
  const [isGuardando, setIsGuardando] = useState(false);
  const [nombreNuevaRuta, setNombreNuevaRuta] = useState('');
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  const ultimoBusqueda = useRef<{ campo: 'origen' | 'destino' | null; texto: string }>({ campo: null, texto: '' });
  const timerBusqueda = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved routes when tab is switched
  useEffect(() => {
    if (tabActual === 'guardadas' && token) {
      listarRutasGuardadasApi(token)
        .then(setRutasGuardadas)
        .catch(() => setRutasGuardadas([]));
    }
  }, [tabActual, token]);

  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
    setOrigen({ texto: 'Mi ubicación actual (GPS)', coords: userCoords });
  };

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
    setMensajeGuardado(null);

    let coordsOrigen = origen.coords;
    let coordsDestino = destino.coords;

    if (!coordsOrigen && origen.texto.trim().length >= 3) {
      setIsSearching(true);
      try {
        const lugares = await buscarLugares(origen.texto.trim());
        if (lugares.length > 0) {
          coordsOrigen = [lugares[0].lat, lugares[0].lng];
          setOrigen({ texto: lugares[0].nombre, coords: coordsOrigen });
        }
      } catch {
        // Validation will handle error
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
        // Validation will handle error
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

      const rutaConNombres: RutaPlanificada = {
        ...route,
        origenNombre: origen.texto,
        destinoNombre: destino.texto,
      };

      setActiveRoute(rutaConNombres);
      onRouteCalculated(rutaConNombres);

      // HU-09: Fetch incidents along route
      try {
        const incidentes = await fetchIncidentesEnRuta(route.puntos, 150);
        setRouteIncidents(incidentes);
        if (onFilterIncidentsOnRoute) {
          onFilterIncidentsOnRoute(incidentes);
        }
      } catch {
        setRouteIncidents([]);
      }
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
    setRouteIncidents([]);
    onRouteCalculated(null);
    onRoutingError(null);
    if (onFilterIncidentsOnRoute) {
      onFilterIncidentsOnRoute(null);
    }
  };

  // HU-16: Save frequent route
  const handleGuardarRuta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeRoute) return;
    const nombre = nombreNuevaRuta.trim();
    if (!nombre) {
      setError('Ingresa un nombre para la ruta.');
      return;
    }

    try {
      const nueva = await guardarRutaApi({
        nombre,
        origenNombre: activeRoute.origenNombre || origen.texto || 'Origen',
        destinoNombre: activeRoute.destinoNombre || destino.texto || 'Destino',
        latOrigen: activeRoute.puntos[0][0],
        lngOrigen: activeRoute.puntos[0][1],
        latDestino: activeRoute.puntos[activeRoute.puntos.length - 1][0],
        lngDestino: activeRoute.puntos[activeRoute.puntos.length - 1][1],
        distanciaKm: activeRoute.distanciaKm,
        duracionMin: activeRoute.duracionMin,
        puntos: activeRoute.puntos,
      }, token);

      setRutasGuardadas(prev => [nueva, ...prev]);
      setIsGuardando(false);
      setNombreNuevaRuta('');
      setMensajeGuardado('¡Ruta guardada!');
      setTimeout(() => setMensajeGuardado(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al guardar la ruta.');
    }
  };

  // HU-16: Load saved route without recalculating
  const handleCargarRutaGuardada = (ruta: RutaGuardada) => {
    const rutaPlanificada: RutaPlanificada = {
      distanciaKm: ruta.distanciaKm,
      duracionMin: ruta.duracionMin,
      puntos: ruta.puntos,
      origenNombre: ruta.origenNombre,
      destinoNombre: ruta.destinoNombre,
    };
    setActiveRoute(rutaPlanificada);
    onRouteCalculated(rutaPlanificada);
    setTabActual('planificar');

    // HU-09: check incidents for this saved route
    fetchIncidentesEnRuta(ruta.puntos, 150)
      .then((inc) => {
        setRouteIncidents(inc);
        if (onFilterIncidentsOnRoute) {
          onFilterIncidentsOnRoute(inc);
        }
      })
      .catch(() => {
        setRouteIncidents([]);
        if (onFilterIncidentsOnRoute) {
          onFilterIncidentsOnRoute([]);
        }
      });
  };

  const handleEliminarRutaGuardada = async (id: string) => {
    if (!token) return;
    try {
      await eliminarRutaGuardadaApi(id, token);
      setRutasGuardadas(prev => prev.filter(r => r.id !== id));
    } catch {
      // Ignored
    }
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
        <div className={esOrigen ? '' : 'mt-2.5'}>
          <div className="flex items-center justify-between mb-1">
            <label className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
              {esOrigen ? 'Origen' : 'Destino'}
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
              placeholder={esOrigen ? 'Ej. Miraflores, Parque Kennedy' : 'Ej. UNTELS, Ovalo Higuereta'}
              className={inputClass}
            />
            {isSearching && sugerencias.campo === campo && (
              <span className="absolute right-3 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            )}
          </div>
        </div>

        {mostrarSugerencias(campo) && (
          <ul className="absolute z-40 left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 max-h-48 overflow-y-auto">
            {sugerencias.lugares.map((lugar) => (
              <li key={`${lugar.lat}-${lugar.lng}-${lugar.nombre}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => seleccionarSugerencia(campo, lugar)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-container flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline mt-0.5">place</span>
                  <span className="font-body-sm text-xs text-on-surface line-clamp-2">{lugar.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-lg border border-outline-variant/30 p-4 w-full max-w-sm sm:max-w-md transition-all">
      {/* Header and Mode Toggle */}
      <div className="flex items-center justify-between pb-2.5 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-sm font-bold text-on-surface">
              Planificar Ruta
            </h2>
            <p className="font-body-sm text-[10px] text-on-surface-variant">
              Ciclovías de Lima
            </p>
          </div>
        </div>

        {/* Tab switch between Plan & Saved */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full">
          <button
            type="button"
            onClick={() => setTabActual('planificar')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              tabActual === 'planificar' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Ruta
          </button>
          <button
            type="button"
            onClick={() => setTabActual('guardadas')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              tabActual === 'guardadas' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Guardadas
          </button>
        </div>

        {activeRoute && (
          <button
            onClick={handleClearRoute}
            className="text-xs text-outline hover:text-error transition-colors p-1 cursor-pointer"
            title="Limpiar ruta"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* TAB: PLANIFICAR */}
      {tabActual === 'planificar' && (
        <>
          <form onSubmit={handleCalculate} className="mt-3 space-y-2.5">
            {renderCampo('origen')}
            {renderCampo('destino')}

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full h-10 bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
              >
                {isCalculating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Calculando...</span>
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
                  <span>{error}</span>
                </p>
              )}

              {mensajeGuardado && (
                <p className="text-[11px] text-primary font-bold flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>{mensajeGuardado}</span>
                </p>
              )}
            </div>
          </form>

          {/* Route Summary (HU-08, HU-09, HU-16) */}
          {activeRoute && (
            <div className="mt-3 pt-3 border-t border-surface-container space-y-2.5 animate-fadeIn">
              {/* Distance and Duration Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-xl p-2.5 text-center">
                <div>
                  <span className="text-[10px] uppercase text-outline tracking-wider block font-semibold">Distancia</span>
                  <span className="font-metric-val text-base font-bold text-on-surface">
                    {activeRoute.distanciaKm} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-outline tracking-wider block font-semibold">Tiempo</span>
                  <span className="font-metric-val text-base font-bold text-primary">
                    ~{activeRoute.duracionMin} min
                  </span>
                </div>
              </div>

              {/* HU-08: Elevation Profile Component */}
              <PerfilElevacion
                perfil={activeRoute.perfilElevacion}
                elevacionGanada={activeRoute.elevacionGanadaMetros}
                elevacionPerdida={activeRoute.elevacionPerdidaMetros}
              />

              {/* HU-09: Incidents on Route Alert */}
              {routeIncidents.length > 0 ? (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                      <span>{routeIncidents.length} incidentes en ruta</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDestino(ENTRADA_VACIA)}
                      className="text-primary text-[11px] hover:underline font-semibold cursor-pointer"
                    >
                      Cambiar ruta
                    </button>
                  </div>
                  <ul className="text-[11px] text-on-surface-variant divide-y divide-amber-500/20">
                    {routeIncidents.slice(0, 3).map(inc => (
                      <li key={inc.id} className="py-1 flex items-center justify-between gap-1">
                        <span className="capitalize font-semibold truncate">{inc.category}: {inc.title}</span>
                        <span className="text-[10px] text-outline shrink-0">{inc.locationName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Sin incidentes reportados en este recorrido</span>
                </p>
              )}

              {/* HU-16: Save Route Option */}
              {usuario && (
                <div>
                  {isGuardando ? (
                    <form onSubmit={handleGuardarRuta} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={nombreNuevaRuta}
                        onChange={(e) => setNombreNuevaRuta(e.target.value)}
                        placeholder="Nombre de la ruta..."
                        className="flex-1 h-9 px-3 bg-surface-container-low text-on-surface text-xs rounded-full outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        className="px-3 h-9 bg-primary text-on-primary text-xs font-bold rounded-full hover:bg-primary-container cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsGuardando(false)}
                        className="px-2.5 h-9 bg-surface-container text-xs rounded-full hover:bg-surface-container-high cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsGuardando(true)}
                      className="w-full h-8 bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">bookmark</span>
                      <span>Guardar ruta frecuente</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB: RUTAS GUARDADAS (HU-16) */}
      {tabActual === 'guardadas' && (
        <div className="mt-3 space-y-2">
          {!usuario ? (
            <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl">
              <p>Inicia sesión para consultar tus rutas frecuentes.</p>
            </div>
          ) : rutasGuardadas.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl">
              <p>No tienes rutas guardadas aún.</p>
              <button
                type="button"
                onClick={() => setTabActual('planificar')}
                className="mt-2 text-primary font-bold hover:underline cursor-pointer"
              >
                Planificar una ruta
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-container max-h-64 overflow-y-auto">
              {rutasGuardadas.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-label-md text-xs font-bold text-on-surface truncate">
                      {r.nombre}
                    </p>
                    <p className="font-body-sm text-[10px] text-on-surface-variant">
                      {r.distanciaKm} km · ~{r.duracionMin} min
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCargarRutaGuardada(r)}
                      className="px-2.5 py-1 bg-primary text-on-primary text-[11px] font-bold rounded-full hover:bg-primary-container cursor-pointer"
                    >
                      Cargar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarRutaGuardada(r.id)}
                      className="w-7 h-7 flex items-center justify-center text-outline hover:text-error rounded-full cursor-pointer"
                      title="Eliminar ruta"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanificadorRuta;
