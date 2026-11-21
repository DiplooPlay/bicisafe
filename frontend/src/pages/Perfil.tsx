import React, { useState, useEffect } from 'react';
import { obtenerPerfilCompleto } from '../services/auth';
import type { PerfilUsuario } from '../types/sesion';
import { useSesion } from '../hooks/useSesion';

interface PerfilProps {
  onVolverAlMapa: () => void;
  onLogout?: () => void;
  showNotification?: (msg: string) => void;
}

export const Perfil: React.FC<PerfilProps> = ({ onVolverAlMapa }) => {
  const { token, usuario } = useSesion();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

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
                <p className="font-body-sm text-[10px] text-on-surface-variant">Máx. 20 pts</p>
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

      </div>
    </div>
  );
};

export default Perfil;
