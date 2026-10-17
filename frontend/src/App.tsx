import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import MapaInteractivo from './components/mapa/MapaInteractivo';
import PlanificadorRuta from './components/rutas/PlanificadorRuta';
import ReportarIncidenciaModal from './components/incidentes/ReportarIncidenciaModal';
import ValidarIncidentes from './components/incidentes/ValidarIncidentes';
import Login from './pages/Login';
import Registro from './pages/Registro';
import VerificarCorreo from './pages/VerificarCorreo';
import {
  fetchIncidentesActivos,
  fetchTodosIncidentes,
  reportarIncidenteApi,
  confirmarIncidenteApi,
  resolverIncidenteApi
} from './services/incidenteService';
import { CYCLEWAYS_LIMA } from './services/mockData';
import useGeolocalizacion from './hooks/useGeolocalizacion';
import { ProveedorSesion, useSesion } from './context/SesionContext';
import { Incident } from './types';
import { RutaPlanificada } from './types/rutas';

type Vista = 'mapa' | 'validar' | 'reportar' | 'login' | 'registro' | 'verificar';

interface ContenidoAppProps {
  tokenVerificacion: string | null;
}

/**
 * E1: session gating (registration/verification/login; only an authenticated
 * cyclist reports or validates). E2/E3: real route planning and incident
 * persistence through the services, both resilient to a disconnected backend.
 */
const ContenidoApp: React.FC<ContenidoAppProps> = ({ tokenVerificacion }) => {
  const { usuario, cerrarSesion } = useSesion();
  const [vista, setVista] = useState<Vista>(tokenVerificacion ? 'verificar' : 'mapa');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cycleways] = useState(CYCLEWAYS_LIMA);
  const [plannedRoute, setPlannedRoute] = useState<RutaPlanificada | null>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [reputationScore, setReputationScore] = useState(16);
  const [notification, setNotification] = useState<string | null>(null);

  // Hook de Geolocalización con alta precisión (GPS / Triangulación satelital)
  const { coords: userCoords, accuracy, isHighAccuracy, obtenerUbicacion: handleGetLocation } = useGeolocalizacion();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Carga inicial de incidentes desde el servicio
  const cargarIncidentes = useCallback(async () => {
    const datos = await fetchIncidentesActivos();
    setIncidents(datos);
  }, []);

  useEffect(() => {
    cargarIncidentes();
  }, [cargarIncidentes]);

  // Cargar todos los incidentes si se abre la pestaña de validación
  useEffect(() => {
    if (vista === 'validar') {
      fetchTodosIncidentes().then(setIncidents);
    }
  }, [vista]);

  // HU3: Confirmar incidente (+1 voto / consenso)
  const handleConfirmIncident = async (id: string) => {
    // Actualización optimista inmediata en UI
    setIncidents(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newVotes = item.votesConfirm + 1;
          const isNowConfirmed = newVotes >= item.requiredVotes;
          return {
            ...item,
            votesConfirm: newVotes,
            status: isNowConfirmed ? 'CONFIRMED' : item.status
          };
        }
        return item;
      })
    );
    setReputationScore(r => Math.min(20, r + 2));
    showNotification('✅ Incidente confirmado (+2 pts de confianza comunitaria).');

    // Persistir en backend
    await confirmarIncidenteApi(id);
  };

  // HU4: Marcar incidente como resuelto / ya no existe
  const handleRejectIncident = async (id: string) => {
    // Actualización optimista inmediata en UI (retirar del mapa activo)
    setIncidents(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'RESOLVED',
            votesReject: item.votesReject + 1
          };
        }
        return item;
      })
    );
    showNotification('🗑️ Incidente marcado como resuelto. Retirado del mapa de alertas activas.');

    // Persistir en backend
    await resolverIncidenteApi(id);
  };

  // HU2: Reportar nuevo incidente
  const handleNewReport = async (newReportData: Omit<Incident, 'id' | 'createdAt'>) => {
    const reportGuardado = await reportarIncidenteApi(newReportData);
    setIncidents(prev => [reportGuardado, ...prev]);
    setReputationScore(r => Math.min(20, r + 2));
    showNotification('📢 ¡Incidente publicado! La comunidad ha sido alertada en el mapa.');
  };

  const handleSelectMapLocation = (lat: number, lng: number) => {
    setPickedCoords({ lat, lng });
    setIsPickingLocation(false);
    setIsReportModalOpen(true);
    showNotification(`📍 Coordenadas fijadas en mapa (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  /** E1: solo el ciclista autenticado abre el asistente de reporte. */
  const abrirReporteOCuenta = () => {
    if (!usuario) {
      setVista('login');
      showNotification('Inicia sesión para reportar y validar incidentes.');
      return;
    }
    setIsReportModalOpen(true);
  };

  /** E1: la validación comunitaria requiere sesión de ciclista. */
  const abrirValidarOCuenta = () => {
    if (!usuario) {
      setVista('login');
      showNotification('Inicia sesión para reportar y validar incidentes.');
      return;
    }
    setVista('validar');
  };

  const manejarLogout = () => {
    cerrarSesion();
    setVista('mapa');
    showNotification('Sesión cerrada correctamente.');
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface antialiased flex flex-col justify-between">

      {/* Top Navbar */}
      <Navbar
        currentTab={vista}
        onSelectTab={(tab: string) => {
          if (tab === 'reportar') {
            abrirReporteOCuenta();
          } else if (tab === 'validar') {
            abrirValidarOCuenta();
          } else if (tab === 'login' && usuario) {
            showNotification('Ya tienes sesión activa. Usa el botón de salir en la barra superior.');
          } else {
            setVista(tab as Vista);
          }
        }}
        usuario={{ correo: usuario?.correo ?? null, nombre: usuario?.nombre ?? null }}
        onLogout={manejarLogout}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 animate-fadeIn">
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 pb-16 md:pb-0 relative">

        {/* TAB: MAPA (HU1, HU2, HU3, HU4, HU6) */}
        {vista === 'mapa' && (
          <div className="relative w-full h-[calc(100vh-4rem)]">

            {/* Mapa Interactivo Leaflet */}
            <MapaInteractivo
              incidents={incidents}
              cycleways={cycleways}
              plannedRoute={plannedRoute}
              routingError={routingError}
              userCoords={userCoords}
              accuracy={accuracy}
              isHighAccuracy={isHighAccuracy}
              onConfirmIncident={handleConfirmIncident}
              onRejectIncident={handleRejectIncident}
              onSelectMapLocation={handleSelectMapLocation}
              onRecenterGPS={handleGetLocation}
              isPickingLocation={isPickingLocation}
            />

            {/* Planificador de Ruta (Desktop) */}
            <div className="absolute top-16 left-4 z-30 max-w-sm hidden md:block">
              <PlanificadorRuta
                onRouteCalculated={setPlannedRoute}
                onRoutingError={setRoutingError}
                userCoords={userCoords}
                onUseCurrentLocation={handleGetLocation}
              />
            </div>

            {/* Planificador de Ruta (Mobile) */}
            <div className="md:hidden absolute bottom-20 left-4 right-4 z-30">
              <PlanificadorRuta
                onRouteCalculated={setPlannedRoute}
                onRoutingError={setRoutingError}
                userCoords={userCoords}
                onUseCurrentLocation={handleGetLocation}
              />
            </div>

          </div>
        )}

        {/* TAB: VALIDACIÓN COMUNITARIA (requiere sesión de ciclista) */}
        {vista === 'validar' && usuario && (
          <ValidarIncidentes
            incidents={incidents}
            onConfirmIncident={handleConfirmIncident}
            onRejectIncident={handleRejectIncident}
            reputationScore={reputationScore}
          />
        )}

        {/* TAB: LOGIN (HU5) */}
        {vista === 'login' && (
          <Login
            onLoginSuccess={(correo) => {
              setVista('mapa');
              showNotification(`¡Bienvenido de vuelta, ${correo}!`);
            }}
            onNavigateToRegister={() => setVista('registro')}
          />
        )}

        {/* TAB: REGISTRO (HU5) */}
        {vista === 'registro' && (
          <Registro
            onSuccess={() => {
              setVista('login');
              showNotification('Revisa tu correo: te enviamos el enlace de verificación.');
            }}
            onNavigateToLogin={() => setVista('login')}
          />
        )}

        {/* TAB: VERIFICACIÓN (llega desde el enlace del correo ?token=...) */}
        {vista === 'verificar' && tokenVerificacion && (
          <VerificarCorreo
            token={tokenVerificacion}
            onNavigateToLogin={() => setVista('login')}
          />
        )}

      </main>

      {/* Modal de Reporte de Incidente (requiere sesión; se abre desde Navbar/BottomNav) */}
      <ReportarIncidenciaModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleNewReport}
        onTriggerMapPicker={() => {
          setIsPickingLocation(true);
          setVista('mapa');
        }}
        pickedCoords={pickedCoords}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={vista}
        onSelectTab={(tab: string) => {
          if (tab === 'reportar') {
            abrirReporteOCuenta();
          } else if (tab === 'validar') {
            abrirValidarOCuenta();
          } else if (tab === 'login' && usuario) {
            showNotification('Ya tienes sesión activa. Usa el botón de salir en la barra superior.');
          } else {
            setVista(tab as Vista);
          }
        }}
        pendingCount={incidents.filter(i => i.status === 'PENDING').length}
      />

    </div>
  );
};

/** Reads ?token=... from the verification email link before mounting the app shell. */
export const App: React.FC = () => {
  const tokenVerificacion = new URLSearchParams(window.location.search).get('token');

  return (
    <ProveedorSesion>
      <ContenidoApp tokenVerificacion={tokenVerificacion} />
    </ProveedorSesion>
  );
};

export default App;
