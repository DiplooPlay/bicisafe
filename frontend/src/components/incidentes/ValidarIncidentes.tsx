import React, { useState } from 'react';
import { Incident, IncidentStatus } from '../../types';

interface ValidarIncidentesProps {
  incidents: Incident[];
  onConfirmIncident: (id: string) => void;
  onRejectIncident: (id: string) => void;
  reputationScore?: number;
}

export const ValidarIncidentes: React.FC<ValidarIncidentesProps> = ({
  incidents,
  onConfirmIncident,
  onRejectIncident,
  reputationScore = 16
}) => {
  const [activeTab, setActiveTab] = useState<IncidentStatus | 'ALL'>('PENDING');

  const filtered = incidents.filter(i => {
    if (activeTab === 'ALL') return true;
    return i.status === activeTab;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-margin-mobile lg:px-margin py-6">
      
      {/* Top Header & Reputation Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-container">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Gobernanza Descentralizada & Consenso Vial
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Validación de Incidentes
          </h1>
          <p className="text-sm text-on-surface-variant max-w-xl mt-1">
            Sin moderador central: la comunidad ciclista confirma o retira reportes para mantener el mapa actualizado.
          </p>
        </div>

        {/* Reputation Card (Stitch Component) */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 min-w-[260px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Tu Nivel de Confianza
            </span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-val text-2xl font-bold text-primary">{reputationScore}</span>
            <span className="text-xs text-on-surface-variant">/ 20 pts</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-semibold">
              Confiable ⭐
            </span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 my-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${(reputationScore / 20) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-outline">
            <span>+2 por reporte verídico</span>
            <span className="text-error">-3 por falso</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-6 pb-1">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>Pendientes de Confirmación</span>
          <span className="px-1.5 py-0.2 bg-primary-container/40 rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'PENDING').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DISPUTED')}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'DISPUTED'
              ? 'bg-secondary text-on-secondary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>En Disputa</span>
          <span className="px-1.5 py-0.2 bg-secondary-container/40 rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'DISPUTED').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'CONFIRMED'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>Confirmados Activos</span>
          <span className="px-1.5 py-0.2 bg-surface-container rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'CONFIRMED').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'RESOLVED'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>Ya no existen / Retirados</span>
          <span className="px-1.5 py-0.2 bg-surface-container rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'RESOLVED').length}
          </span>
        </button>
      </div>

      {/* Reports Feed */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">done_all</span>
          <h3 className="font-headline-sm text-base font-bold text-on-surface">
            No hay reportes en esta categoría
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Todas las alertas comunitarias se encuentran verificadas o al día.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary text-xs font-semibold flex items-center gap-1 capitalize">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {item.category}
                  </span>
                  <span className="text-[11px] text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Expira en: {item.expiresInMinutes} min
                  </span>
                </div>

                <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-primary font-medium flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {item.locationName}
                </p>
                <p className="text-xs text-on-surface-variant line-clamp-3">
                  {item.description}
                </p>

                {item.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-36 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Author & Votes Status */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2">
                  <span>Reportado por: <strong>{item.authorName}</strong></span>
                  <span className="text-primary font-semibold">Reputación: {item.authorReputation} pts</span>
                </div>

                {/* Consensus Progress Bar */}
                <div className="p-3 bg-surface-container-low rounded-xl mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-on-surface">Consenso Requerido</span>
                    <span className="font-bold text-primary">
                      {item.votesConfirm} / {item.requiredVotes} Confirmaciones
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (item.votesConfirm / item.requiredVotes) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions (User Story 6 & 7) */}
                {item.status !== 'RESOLVED' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onConfirmIncident(item.id)}
                      className="flex-1 h-9 px-3 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                      <span>Confirmar (+1)</span>
                    </button>

                    <button
                      onClick={() => onRejectIncident(item.id)}
                      className="flex-1 h-9 px-3 rounded-full bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Ya no existe / Resuelto</span>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
};

export default ValidarIncidentes;
