import React, { useState } from 'react';
import { denunciarIncidenteApi } from '../../services/incidenteService';
import { Incident } from '../../types';

interface DenunciarIncidenteModalProps {
  isOpen: boolean;
  incidenteId: string | null;
  incidenteTitulo?: string;
  onClose: () => void;
  onSuccess: (updated?: Incident) => void;
}

export const DenunciarIncidenteModal: React.FC<DenunciarIncidenteModalProps> = ({
  isOpen,
  incidenteId,
  incidenteTitulo,
  onClose,
  onSuccess,
}) => {
  const [motivo, setMotivo] = useState<'FALSO' | 'DUPLICADO' | 'INEXISTENTE' | 'OTRO'>('FALSO');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incidenteId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const updated = await denunciarIncidenteApi(incidenteId, motivo, comentario.trim() || undefined);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al enviar reporte.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-sm w-full bg-surface-container-lowest rounded-2xl p-5 shadow-xl border border-outline-variant/30 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-error font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">flag</span>
            <span>Denunciar incidente</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {incidenteTitulo && (
          <p className="font-body-sm text-xs text-on-surface-variant truncate">
            {incidenteTitulo}
          </p>
        )}

        {error && (
          <div className="p-2.5 bg-error-container/40 border border-error/40 text-error rounded-xl font-body-sm text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
              Motivo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['FALSO', 'DUPLICADO', 'INEXISTENTE', 'OTRO'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotivo(m)}
                  className={`h-9 px-3 rounded-full font-label-md text-xs font-semibold border transition-all cursor-pointer ${
                    motivo === m
                      ? 'bg-error/10 border-error text-error'
                      : 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {m === 'FALSO' ? 'Falso' : m === 'DUPLICADO' ? 'Duplicado' : m === 'INEXISTENTE' ? 'Inexistente' : 'Otro'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="denuncia-comentario" className="block font-label-md text-xs font-semibold text-on-surface mb-1">
              Detalle (opcional)
            </label>
            <input
              id="denuncia-comentario"
              type="text"
              maxLength={120}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Descripción breve"
              className="w-full h-10 px-3.5 bg-surface-container-low text-on-surface font-body-sm text-xs rounded-xl outline-none focus:ring-2 focus:ring-primary border border-transparent"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 h-10 bg-error hover:opacity-90 text-on-error font-label-md text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <span>{enviando ? 'Enviando...' : 'Enviar reporte'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 bg-surface-container text-on-surface font-label-md text-xs rounded-full hover:bg-surface-container-high cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default DenunciarIncidenteModal;
