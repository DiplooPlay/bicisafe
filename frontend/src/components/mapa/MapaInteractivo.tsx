import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, CycleWay } from '../../types';
import { RutaPlanificada } from '../../types/rutas';

interface MapaInteractivoProps {
  incidents: Incident[];
  cycleways: CycleWay[];
  plannedRoute: RutaPlanificada | null;
  routingError: string | null;
  userCoords: [number, number] | null;
  accuracy?: number | null;
  isHighAccuracy?: boolean;
  onConfirmIncident: (id: string) => void;
  onRejectIncident: (id: string) => void;
  onSelectMapLocation?: (lat: number, lng: number) => void;
  onRecenterGPS?: () => void;
  isPickingLocation?: boolean;
}

// Custom DivIcons matching Stitch design
const createUserIcon = () =>
  L.divIcon({
    className: 'custom-pin',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="w-9 h-9 rounded-full bg-emerald-500/25 animate-ping absolute"></span>
        <span class="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg ring-2 ring-white relative z-10">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
        </span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

const createIncidentIcon = (category: string, status: string) => {
  let bgColor = 'bg-amber-500';
  let iconName = 'warning';

  if (category === 'bache') {
    bgColor = 'bg-red-600';
    iconName = 'priority_high';
  } else if (category === 'obras') {
    bgColor = 'bg-sky-600';
    iconName = 'construction';
  } else if (category === 'bloqueo') {
    bgColor = 'bg-rose-700';
    iconName = 'block';
  } else if (category === 'iluminacion') {
    bgColor = 'bg-amber-600';
    iconName = 'lightbulb';
  }

  const isDisputed = status === 'DISPUTED';

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
        <div class="flex items-center gap-1.5 ${isDisputed ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-white text-slate-800'} px-2.5 py-1 rounded-full shadow-md border border-slate-100">
          <div class="w-5 h-5 rounded-full ${bgColor} text-white flex items-center justify-center text-[12px] font-bold">
            <span class="material-symbols-outlined text-[13px] leading-none">${iconName}</span>
          </div>
          <span class="font-sans text-[11px] font-semibold pr-1 capitalize whitespace-nowrap">${category}</span>
        </div>
      </div>
    `,
    iconSize: [85, 28],
    iconAnchor: [42, 14]
  });
};

// Component to handle map re-centering
function RecenterController({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

// Component to handle click to pick location
function MapClickHandler({ onPick, active }: { onPick?: (lat: number, lng: number) => void; active?: boolean }) {
  const map = useMap();
  React.useEffect(() => {
    if (!active || !onPick) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      onPick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onPick, active]);
  return null;
}

// Límites geográficos: Lima Metropolitana y Villa El Salvador (evita desplazarse a zonas externas)
const LIMITES_LIMA_VES: L.LatLngBoundsLiteral = [
  [-12.38, -77.25], // Suroeste: Villa El Salvador / Lurín / Litoral Pacífico
  [-11.75, -76.80]  // Noreste: Carabayllo / San Juan de Lurigancho / Ate
];

export const MapaInteractivo: React.FC<MapaInteractivoProps> = ({
  incidents,
  cycleways,
  plannedRoute,
  routingError,
  userCoords,
  accuracy,
  isHighAccuracy,
  onConfirmIncident,
  onRejectIncident,
  onSelectMapLocation,
  onRecenterGPS,
  isPickingLocation
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('todo');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapMode, setMapMode] = useState<'cyclosm' | 'estandar'>('cyclosm');

  // Filter logic
  const filteredIncidents = incidents.filter(inc => {
    if (filterCategory === 'todo') return true;
    if (filterCategory === 'alertas') return inc.status !== 'RESOLVED';
    return inc.category === filterCategory;
  });

  const showSegregated = filterCategory === 'todo' || filterCategory === 'segregadas';
  const showVias30 = filterCategory === 'todo' || filterCategory === 'vias30';

  const defaultCenter: [number, number] = [-12.1217, -77.0298]; // Lima - Miraflores

  const handleZoom = (delta: number) => {
    if (mapInstance) {
      if (delta > 0) mapInstance.zoomIn();
      else mapInstance.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-surface-container-low select-none">
      
      {/* Resiliency Banner (User Story: Falla de servicio de rutas) */}
      {routingError && (
        <div className="absolute top-3 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-xl bg-amber-500 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-bounce">
          <span className="material-symbols-outlined text-[18px]">wifi_off</span>
          <span>{routingError}</span>
        </div>
      )}

      {/* Picking Location Banner */}
      {isPickingLocation && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-primary text-on-primary px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-pulse">
          <span className="material-symbols-outlined text-[18px]">touch_app</span>
          <span>Haz clic en el mapa de Lima para fijar la ubicación del reporte</span>
        </div>
      )}

      {/* Floating Filter Chips (Stitch Style) */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-1">
        <button
          onClick={() => setFilterCategory('todo')}
          className={`shrink-0 h-8 px-3.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            filterCategory === 'todo'
              ? 'bg-primary text-on-primary font-bold'
              : 'bg-surface-container-lowest/95 backdrop-blur-md text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>Todo</span>
        </button>

        <button
          onClick={() => setFilterCategory('segregadas')}
          className={`shrink-0 h-8 px-3.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            filterCategory === 'segregadas'
              ? 'bg-primary text-on-primary font-bold'
              : 'bg-surface-container-lowest/95 backdrop-blur-md text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Segregadas</span>
        </button>

        <button
          onClick={() => setFilterCategory('vias30')}
          className={`shrink-0 h-8 px-3.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            filterCategory === 'vias30'
              ? 'bg-secondary text-on-secondary font-bold'
              : 'bg-surface-container-lowest/95 backdrop-blur-md text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>Vías 30</span>
        </button>

        <button
          onClick={() => setFilterCategory('alertas')}
          className={`shrink-0 h-8 px-3.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            filterCategory === 'alertas'
              ? 'bg-error text-on-error font-bold'
              : 'bg-surface-container-lowest/95 backdrop-blur-md text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-error"></span>
          <span>Alertas ({incidents.filter(i => i.status !== 'RESOLVED').length})</span>
        </button>

        {/* GPS Accuracy Indicator Badge */}
        {accuracy !== null && (
          <div className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest/95 backdrop-blur-md rounded-full shadow-sm text-[11px] font-semibold text-on-surface border border-outline-variant/30">
            <span className={`w-2 h-2 rounded-full ${isHighAccuracy ? 'bg-primary animate-pulse' : 'bg-amber-500'}`}></span>
            <span>{isHighAccuracy ? 'GPS Preciso' : 'GPS Estimado'} (±{accuracy}m)</span>
          </div>
        )}
      </div>

      {/* Floating Zoom & Location HUD Controls (Stitch layout) */}
      <div className="absolute right-4 top-20 z-30 flex flex-col gap-2">
        <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-outline-variant/30 flex flex-col">
          <button
            onClick={() => handleZoom(1)}
            title="Acercar mapa"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <div className="w-6 h-px bg-surface-container mx-auto"></div>
          <button
            onClick={() => handleZoom(-1)}
            title="Alejar mapa"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>

        {/* Toggle Modo Ciclovías (CyclOSM) / Mapa Estándar */}
        <button
          onClick={() => setMapMode((prev) => (prev === 'cyclosm' ? 'estandar' : 'cyclosm'))}
          title={mapMode === 'cyclosm' ? 'Cambiar a Mapa Estándar' : 'Activar Mapa Ciclovías (CyclOSM)'}
          className={`w-11 h-11 backdrop-blur-md rounded-2xl shadow-md border border-outline-variant/30 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            mapMode === 'cyclosm'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest/95 text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {mapMode === 'cyclosm' ? 'directions_bike' : 'map'}
          </span>
        </button>

        {onRecenterGPS && (
          <button
            onClick={onRecenterGPS}
            title="Centrar en mi ubicación"
            className="w-11 h-11 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-md border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">my_location</span>
          </button>
        )}
      </div>

      {/* Map Container con restricción a Lima y Villa El Salvador */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        minZoom={11}
        maxBounds={LIMITES_LIMA_VES}
        maxBoundsViscosity={0.9}
        scrollWheelZoom={true}
        zoomControl={false}
        ref={setMapInstance}
        className="w-full h-full"
      >
        {mapMode === 'cyclosm' ? (
          <TileLayer
            key="cyclosm"
            attribution='&copy; <a href="https://www.cyclosm.org">CyclOSM</a> | &copy; OpenStreetMap'
            url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            maxZoom={18}
          />
        ) : (
          <TileLayer
            key="osm"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        <RecenterController coords={userCoords} />
        <MapClickHandler onPick={onSelectMapLocation} active={isPickingLocation} />

        {/* User GPS Pin */}
        {userCoords && (
          <Marker position={userCoords} icon={createUserIcon()}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <p className="font-bold text-xs text-primary">Tu ubicación actual</p>
                <p className="text-[11px] text-slate-500">
                  {accuracy ? `Margen de precisión: ±${accuracy} metros` : 'GPS activo en Lima'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Cycleways: Segregated and Shared 30 (geometría real por calzada) */}
        {cycleways.map((cw) => {
          if (cw.type === 'segregada' && !showSegregated) return null;
          if (cw.type === 'vias30' && !showVias30) return null;

          const isSegregated = cw.type === 'segregada';
          return (
            <React.Fragment key={cw.id}>
              {/* Contorno de resplandor para contraste y visibilidad */}
              <Polyline
                positions={cw.coordinates}
                pathOptions={{
                  color: isSegregated ? '#064e3b' : '#075985',
                  weight: isSegregated ? 7 : 5.5,
                  opacity: 0.35
                }}
              />
              {/* Línea principal vibrante alineada a la pista */}
              <Polyline
                positions={cw.coordinates}
                pathOptions={{
                  color: isSegregated ? '#059669' : '#0284c7',
                  weight: isSegregated ? 4.5 : 3.5,
                  dashArray: isSegregated ? undefined : '6, 6',
                  opacity: 0.95
                }}
              >
                <Popup>
                  <div className="p-1.5 font-sans min-w-[190px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        {isSegregated ? 'directions_bike' : 'share'}
                      </span>
                      <span>{isSegregated ? 'Ciclovía Segregada' : 'Vía Compartida 30'}</span>
                    </span>
                    <p className="font-bold text-xs text-slate-800 mt-0.5">{cw.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cw.surface}</p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Longitud: <b>{cw.distanceKm} km</b></span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        Seguridad {cw.safetyScore}%
                      </span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Planned Route (if any) */}
        {plannedRoute && (
          <Polyline
            positions={plannedRoute.puntos}
            pathOptions={{
              color: '#0284c7',
              weight: 6,
              opacity: 0.95
            }}
          />
        )}

        {/* Incident Pins */}
        {filteredIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.lat, inc.lng]}
            icon={createIncidentIcon(inc.category, inc.status)}
            eventHandlers={{
              click: () => setSelectedIncident(inc)
            }}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-0.5">
                  {inc.category}
                </span>
                <p className="font-bold text-xs text-slate-900 leading-tight mb-1">{inc.title}</p>
                <p className="text-[11px] text-slate-600 mb-1 line-clamp-2">{inc.description}</p>
                <span className="text-[10px] text-slate-400 block">📍 {inc.locationName}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Bottom Drawer for Selected Incident (Stitch Style) */}
      {selectedIncident && (
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-lg bg-surface-container-lowest/98 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-xl border border-outline-variant/30 animate-fadeIn">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[10px] uppercase font-bold tracking-wider">
                  {selectedIncident.category}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {selectedIncident.locationName}
                </span>
              </div>
              <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                {selectedIncident.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-outline hover:text-on-surface p-1 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">
            {selectedIncident.description}
          </p>

          {/* Voting progress */}
          <div className="p-2.5 bg-surface-container-low rounded-xl mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">how_to_vote</span>
                Consenso Comunitario
              </span>
              <span className="font-bold text-primary">
                {selectedIncident.votesConfirm} / {selectedIncident.requiredVotes} Votos
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (selectedIncident.votesConfirm / selectedIncident.requiredVotes) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Actions: Confirmar o Desmentir / Resuelto */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onConfirmIncident(selectedIncident.id);
                setSelectedIncident(null);
              }}
              className="flex-1 h-9 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">thumb_up</span>
              <span>Confirmar (+1)</span>
            </button>

            <button
              onClick={() => {
                onRejectIncident(selectedIncident.id);
                setSelectedIncident(null);
              }}
              className="flex-1 h-9 bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Ya no existe / Resuelto</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaInteractivo;
