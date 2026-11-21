import React, { useState, useEffect } from 'react';
import { obtenerPerfilCompleto, eliminarCuentaApi } from '../services/auth';
import type { PerfilUsuario } from '../types/sesion';
import { useSesion } from '../hooks/useSesion';

interface PerfilProps {
  onVolverAlMapa: () => void;
  onLogout: () => void;
  showNotification: (msg: string) => void;
}

export const Perfil: React.FC<PerfilProps> = ({ onVolverAlMapa, onLogout, showNotification }) => {
  const { token, usuario } = useSesion();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (!token) return;
    setCargando(true);
    obtenerPerfilCompleto(token)
      .then(setPerfil)
      .catch(() => {
        // Fallback with session data
        if (usuario) {
          setPerfil({
            id: usuario.id,
            correo: usuario.correo,
            nombre: usuario.nombre,
            rol: usuario.rol,
            reputacion: usuario.reputacion ?? 15,
            totalReportes: 0,
            fechaRegistro: '2026',
            historialReportes: [],
          });
        }
      })
      .finally(() => setCargando(false));
  }, [token, usuario]);

  const handleEliminarCuenta = async () => {
    if (!token) return;
    setEliminando(true);
    try {
      await eliminarCuentaApi(token);
      showNotification('Cuenta eliminada.');
      onLogout();
    } catch {
      showNotification('Error al eliminar cuenta.');
      setEliminando(false);
      setConfirmarEliminar(false);
    }
  };

  if (cargando) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary font-label-md text-xs">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>Cargando perfil...</span>
        </div>
      </div>
    );
  }

  const reputacion = perfil?.reputacion ?? (usuario?.reputacion ?? 15);
  const nivel = reputacion >= 25 ? 'Ciclista Experto' : reputacion >= 18 ? 'Ciclista Guardián' : 'Ciclista Urbano';

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background p-4 sm:p-6 md:p-8 flex justify-center">
      <div className="max-w-2xl w-full space-y-4">
        
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">directions_bike</span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-headline-sm text-xl font-bold text-on-surface">
                  {perfil?.nombre || usuario?.nombre || 'Ciclista'}
                </h1>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {perfil?.correo || usuario?.correo}
                </p>
              </div>

              <span className="self-center sm:self-start inline-flex items-center gap-1 px-3 py-1 bg-surface-container rounded-full text-primary font-label-sm text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {nivel}
              </span>
            </div>

            {/* Reputation Telemetry */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-container">
              <div className="bg-surface-container-low rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span className="font-label-sm text-[11px] font-bold">REPUTACIÓN</span>
                </div>
                <span className="font-metric-val text-2xl font-bold text-on-surface">
                  {reputacion}
                </span>
                <p className="font-body-sm text-[10px] text-on-surface-variant">Puntos ganados</p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-secondary mb-0.5">
                  <span className="material-symbols-outlined text-[16px]">report</span>
                  <span className="font-label-sm text-[11px] font-bold">REPORTES</span>
                </div>
                <span className="font-metric-val text-2xl font-bold text-on-surface">
                  {perfil?.totalReportes ?? (perfil?.historialReportes?.length || 0)}
                </span>
                <p className="font-body-sm text-[10px] text-on-surface-variant">Aportes a la red</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report History */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <span>Historial de Reportes</span>
            </h2>
            <span className="font-label-sm text-xs text-on-surface-variant">
              {perfil?.historialReportes?.length || 0} activos
            </span>
          </div>

          {!perfil?.historialReportes || perfil.historialReportes.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-3xl mb-1 text-outline">verified_user</span>
              <p className="font-body-sm text-xs">No has reportado incidentes aún.</p>
              <button
                onClick={onVolverAlMapa}
                className="mt-3 px-4 py-1.5 bg-primary text-on-primary rounded-full font-label-md text-xs cursor-pointer hover:bg-primary-container transition-colors"
              >
                Ir al Mapa
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-container">
              {perfil.historialReportes.map((rep) => (
                <div key={rep.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-label-md text-xs font-semibold text-on-surface truncate">
                      {rep.title}
                    </p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                      {rep.locationName}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    rep.status === 'CONFIRMED'
                      ? 'bg-primary/10 text-primary'
                      : rep.status === 'RESOLVED'
                      ? 'bg-surface-container text-outline'
                      : 'bg-amber-500/10 text-amber-700'
                  }`}>
                    {rep.status === 'CONFIRMED' ? 'Confirmado' : rep.status === 'RESOLVED' ? 'Resuelto' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Deletion & Danger Zone (RNF-10) */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
          <h2 className="font-headline-sm text-sm font-bold text-on-surface mb-2">
            Privacidad y Cuenta
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mb-4">
            Solo almacenamos tu correo y nombre. No guardamos tu ubicación en tiempo real.
          </p>

          {confirmarEliminar ? (
            <div className="p-4 bg-error-container/40 border border-error/40 rounded-xl space-y-3">
              <p className="font-label-md text-xs text-error font-bold">
                ¿Seguro que deseas eliminar tu cuenta permanentemente?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={handleEliminarCuenta}
                  className="px-4 py-2 bg-error text-on-error font-label-md text-xs font-bold rounded-full hover:opacity-90 cursor-pointer disabled:opacity-60"
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar cuenta'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarEliminar(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-label-md text-xs rounded-full hover:bg-surface-container-high cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmarEliminar(true)}
              className="text-error font-label-md text-xs hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              <span>Eliminar mi cuenta</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Perfil;
