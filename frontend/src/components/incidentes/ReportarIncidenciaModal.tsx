import React, { useState, useEffect } from 'react';
import { IncidentCategory, Incident } from '../../types';

interface ReportarIncidenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newIncident: Omit<Incident, 'id' | 'createdAt'>) => void;
  onTriggerMapPicker: () => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

const CATEGORIES: { id: IncidentCategory; label: string; icon: string }[] = [
  { id: 'bache', label: 'Bache', icon: 'report_problem' },
  { id: 'obras', label: 'Obras', icon: 'construction' },
  { id: 'bloqueo', label: 'Bloqueo', icon: 'block' },
  { id: 'iluminacion', label: 'Sin luz', icon: 'lightbulb' },
  { id: 'otro', label: 'Otro', icon: 'more_horiz' }
];

export const ReportarIncidenciaModal: React.FC<ReportarIncidenciaModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  onTriggerMapPicker,
  pickedCoords
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('bache');
  const [locationText, setLocationText] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (pickedCoords) {
      setLocationText(`Punto (${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)})`);
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = pickedCoords?.lat || -12.1217;
    const lng = pickedCoords?.lng || -77.0298;
    const catLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Incidente';

    onSubmitReport({
      category: selectedCategory,
      title: `${catLabel} en vía`,
      description: description.trim() || `${catLabel} reportado`,
      locationName: locationText.trim() || 'Lima',
      lat,
      lng,
      votesConfirm: 1,
      votesReject: 0,
      requiredVotes: 3,
      status: 'PENDING',
      authorName: 'Ciclista',
      authorReputation: 15,
      expiresInMinutes: 60,
      imageUrl: photoPreview || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-xl border border-outline-variant/30 space-y-4">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">report</span>
            <h2 className="font-headline-sm text-sm font-bold text-on-surface">
              Reportar incidente
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Tipo */}
          <div>
            <label className="block font-label-md text-xs font-semibold text-on-surface-variant mb-1.5">
              Tipo
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-center gap-1 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-md text-xs font-semibold text-on-surface-variant">
                Ubicación
              </label>
              <button
                type="button"
                onClick={() => {
                  onTriggerMapPicker();
                  onClose();
                }}
                className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-0.5 font-medium"
              >
                <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                <span>Fijar mapa</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Dirección o punto"
              className="w-full h-10 px-3 bg-surface-container-low text-on-surface font-body-md text-xs rounded-xl outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/20"
            />
          </div>

          {/* Detalle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-md text-xs font-semibold text-on-surface-variant">
                Detalle (opcional)
              </label>
              <span className="text-[10px] text-outline">{description.length}/120</span>
            </div>
            <textarea
              maxLength={120}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve"
              className="w-full p-2.5 bg-surface-container-low text-on-surface font-body-md text-xs rounded-xl outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/20 resize-none"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block font-label-md text-xs font-semibold text-on-surface-variant mb-1">
              Foto (opcional)
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-surface-container-low hover:bg-surface-container rounded-xl text-xs font-medium text-on-surface-variant flex items-center gap-1.5 border border-outline-variant/40">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <span className="material-symbols-outlined text-[16px] text-primary">add_photo_alternate</span>
                <span>Subir foto</span>
              </label>
              {photoPreview && (
                <div className="relative inline-block">
                  <img src={photoPreview} alt="Evidencia" className="h-8 w-12 object-cover rounded-lg border border-outline-variant" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute -top-1 -right-1 bg-error text-white rounded-full p-0.5 text-[10px]"
                  >
                    <span className="material-symbols-outlined text-[10px] block">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enviar */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-semibold rounded-full shadow-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Enviar reporte</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReportarIncidenciaModal;
