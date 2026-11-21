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
import RecuperarPassword from './pages/RecuperarPassword';
import RestablecerPassword from './pages/RestablecerPassword';
import Perfil from './pages/Perfil';
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

type Vista = 'mapa' | 'validar' | 'reportar' | 'login' | 'registro' | 'verificar' | 'recuperar' | 'restablecer' | 'perfil';

interface ContenidoAppProps {
  tokenVerificacion: string | null;
  tokenRestablecer: string | null;
}

/**
 * E1: session gating (registration/verification/login; only an authenticated
 * cyclist reports or validates). E2/E3: real route planning and incident
 * persistence through the services, both resilient to a disconnected backend.
 */
const ContenidoApp: React.FC<ContenidoAppProps> = ({ tokenVerificacion, tokenRestablecer }) => {
  const { token, usuario, cerrarSesion } = useSesion();
  const [vista, setVista] = useState<Vista>(
    tokenRestablecer ? 'restablecer' : (tokenVerificacion ? 'verificar' : 'mapa')
  );
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cycleways] = useState(CYCLEWAYS_LIMA);
  const [plannedRoute, setPlannedRoute] = useState<RutaPlanificada | null>(null);
  const [routeIncidents, setRouteIncidents] = useState<Incident[] | null>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [reputationScore, setReputationScore] = useState(usuario?.reputacion ?? 15);
  const [notification, setNotification] = useState<string | null>(null);

  // Hook de Geolocalización con alta precisión (GPS / Triangulación satelital)
  const { coords: userCoords, accuracy, isHighAccuracy, obtenerUbicacion: handleGetLocation } = useGeolocalizacion();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Sincronizar reputación con la sesión activa
  useEffect(() => {
    if (usuario?.reputacion !== undefined) {
      setReputationScore(usuario.reputacion);
    }
  }, [usuario]);

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
    try {
      await confirmarIncidenteApi(id, token);
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
      setReputationScore(r => r + 1);
      showNotification('Incidente confirmado');
    } catch (err: any) {
      showNotification(err.message || 'Error al confirmar');
    }
  };

  // HU4: Marcar incidente como resuelto / ya no existe
  const handleRejectIncident = async (id: string) => {
    try {
      await resolverIncidenteApi(id, token);
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
      showNotification('Incidente resuelto');
    } catch (err: any) {
      showNotification(err.message || 'Error al resolver');
    }
  };

  // HU2: Reportar nuevo incidente
  const handleNewReport = async (newReportData: Omit<Incident, 'id' | 'createdAt'>) => {
    try {
      const reportGuardado = await reportarIncidenteApi(newReportData, token);
      setIncidents(prev => [reportGuardado, ...prev]);
      setReputationScore(r => r + 2);
      showNotification('Incidente reportado');
    } catch (err: any) {
      showNotification(err.message || 'Error al reportar');
    }
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
              routeIncidents={routeIncidents}
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
                onFilterIncidentsOnRoute={setRouteIncidents}
              />
            </div>

            {/* Planificador de Ruta (Mobile) */}
            <div className="md:hidden absolute bottom-20 left-4 right-4 z-30">
              <PlanificadorRuta
                onRouteCalculated={setPlannedRoute}
                onRoutingError={setRoutingError}
                userCoords={userCoords}
                onUseCurrentLocation={handleGetLocation}
                onFilterIncidentsOnRoute={setRouteIncidents}
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
            onNavigateToRecover={() => setVista('recuperar')}
          />
        )}

        {/* TAB: RECUPERAR CONTRASEÑA (HU-03) */}
        {vista === 'recuperar' && (
          <RecuperarPassword
            onVolverALogin={() => setVista('login')}
          />
        )}

        {/* TAB: RESTABLECER CONTRASEÑA (HU-03) */}
        {vista === 'restablecer' && (
          <RestablecerPassword
            token={tokenRestablecer || ''}
            onSuccess={() => {
              setVista('login');
              showNotification('¡Contraseña actualizada! Ya puedes iniciar sesión.');
            }}
            onVolverALogin={() => setVista('login')}
          />
        )}

        {/* TAB: PERFIL Y REPUTACIÓN (HU-04, RNF-10) */}
        {vista === 'perfil' && usuario && (
          <Perfil
            onVolverAlMapa={() => setVista('mapa')}
            onLogout={manejarLogout}
            showNotification={showNotification}
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
            setVista('perfil');
          } else {
            setVista(tab as Vista);
          }
        }}
        pendingCount={incidents.filter(i => i.status === 'PENDING').length}
        isLoggedIn={Boolean(usuario)}
      />

    </div>
  );
};

/** Reads ?token=... or ?resetToken=... from email links before mounting the app shell. */
export const App: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const tokenVerificacion = searchParams.get('token');
  const tokenRestablecer = searchParams.get('resetToken');

  return (
    <ProveedorSesion>
      <ContenidoApp tokenVerificacion={tokenVerificacion} tokenRestablecer={tokenRestablecer} />
    </ProveedorSesion>
  );
};

export default App;
