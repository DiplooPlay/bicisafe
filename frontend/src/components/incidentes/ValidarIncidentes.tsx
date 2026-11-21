import React, { useState } from 'react';
import { Incident, IncidentStatus } from '../../types';
import DenunciarIncidenteModal from './DenunciarIncidenteModal';

interface ValidarIncidentesProps {
  incidents: Incident[];
  onConfirmIncident: (id: string) => void;
  onRejectIncident: (id: string) => void;
  reputationScore?: number;
  votedIncidentIds?: Record<string, 'CONFIRM' | 'RESOLVE'>;
  onIncidentUpdated?: (updated: Incident) => void;
}

export const ValidarIncidentes: React.FC<ValidarIncidentesProps> = ({
  incidents,
  onConfirmIncident,
  onRejectIncident,
  reputationScore = 15,
  votedIncidentIds = {},
  onIncidentUpdated
}) => {
  const [activeTab, setActiveTab] = useState<IncidentStatus | 'ALL'>('PENDING');
  const [incidenteParaDenunciar, setIncidenteParaDenunciar] = useState<Incident | null>(null);
  const [isDenunciarOpen, setIsDenunciarOpen] = useState(false);
  const [denunciaConfirmada, setDenunciaConfirmada] = useState(false);

  const filtered = incidents.filter(i => {
    if (activeTab === 'ALL') return true;
    return i.status === activeTab;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-margin-mobile lg:px-margin py-6">
      
      {/* Top Header & Reputation Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-container">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Incidencias
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Consenso comunitario
          </p>
        </div>

        {/* Reputation Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 min-w-[240px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Tu reputación
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">stars</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-val text-2xl font-bold text-primary">{reputationScore}</span>
            <span className="text-xs text-on-surface-variant">/ 20 pts</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 my-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (reputationScore / 20) * 100))}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-outline">
            <span>+2 reporte</span>
            <span className="text-error">-3 falso</span>
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
          <span>Pendientes</span>
          <span className="px-1.5 py-0.2 bg-primary-container/40 rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'PENDING').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'CONFIRMED'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>Confirmados</span>
          <span className="px-1.5 py-0.2 bg-surface-container rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'CONFIRMED').length}
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
          <span>En disputa</span>
          <span className="px-1.5 py-0.2 bg-secondary-container/40 rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'DISPUTED').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('INVALID')}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'INVALID'
              ? 'bg-error text-on-error shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span>Inválidos</span>
          <span className="px-1.5 py-0.2 bg-error-container/40 rounded-full text-[10px]">
            {incidents.filter(i => i.status === 'INVALID').length}
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
          <span>Resueltos</span>
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

                {/* Consensus Progress Bar & Telemetry */}
                <div className="p-3 bg-surface-container-low rounded-xl mb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface">Validaciones</span>
                    <span className="font-bold text-primary">
                      {item.votesConfirm} / 3
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (item.votesConfirm / 3) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-outline pt-0.5">
                    <span>Falso: <strong className="text-error">{item.reportsFake || 0}/3</strong></span>
                    <span>Resuelto: <strong className="text-secondary">{item.votesReject || 0}/3</strong></span>
                  </div>
                </div>

                {/* Actions (User Story 6 & 7) */}
                {item.status !== 'RESOLVED' && (
                  <div className="flex items-center gap-2 pt-1">
                    {votedIncidentIds[item.id] ? (
                      <div className="flex-1 h-9 px-3 rounded-full bg-surface-container text-outline text-xs font-semibold flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        <span>Votado ({votedIncidentIds[item.id] === 'CONFIRM' ? 'Confirmado' : 'Resuelto'})</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onConfirmIncident(item.id)}
                          className="flex-1 h-9 px-3 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                          <span>Confirmar</span>
                        </button>

                        <button
                          onClick={() => onRejectIncident(item.id)}
                          className="flex-1 h-9 px-3 rounded-full bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Ya no existe</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIncidenteParaDenunciar(item);
                        setIsDenunciarOpen(true);
                      }}
                      title="Reportar como falso o duplicado"
                      className="w-9 h-9 rounded-full bg-surface-container hover:bg-error/10 hover:text-error text-outline flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">flag</span>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Flag / Inappropriate Modal (HU-14) */}
      <DenunciarIncidenteModal
        isOpen={isDenunciarOpen}
        incidenteId={incidenteParaDenunciar?.id || null}
        incidenteTitulo={incidenteParaDenunciar?.title}
        onClose={() => setIsDenunciarOpen(false)}
        onSuccess={(updated) => {
          if (updated && onIncidentUpdated) {
            onIncidentUpdated(updated);
          }
          setDenunciaConfirmada(true);
          setTimeout(() => setDenunciaConfirmada(false), 3000);
        }}
      />

      {denunciaConfirmada && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2">
          <span>🚩 Reporte registrado para moderación comunitaria.</span>
        </div>
      )}

    </div>
  );
};

export default ValidarIncidentes;
