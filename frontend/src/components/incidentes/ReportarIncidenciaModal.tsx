import React, { useState } from 'react';
import { IncidentCategory, Incident } from '../../types';

interface ReportarIncidenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newIncident: Omit<Incident, 'id' | 'createdAt'>) => void;
  onTriggerMapPicker: () => void;
  pickedCoords?: { lat: number; lng: number } | null;
}

const CATEGORIES: { id: IncidentCategory; label: string; icon: string }[] = [
  { id: 'bache', label: 'Bache severo', icon: 'report_problem' },
  { id: 'obras', label: 'Obras sin desvío', icon: 'construction' },
  { id: 'bloqueo', label: 'Bloqueo vehicular', icon: 'block' },
  { id: 'iluminacion', label: 'Luz deficiente', icon: 'lightbulb' },
  { id: 'otro', label: 'Otro obstáculo', icon: 'more_horiz' }
];

export const ReportarIncidenciaModal: React.FC<ReportarIncidenciaModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  onTriggerMapPicker,
  pickedCoords
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('bache');
  const [locationText, setLocationText] = useState('Ciclovía Av. Arequipa con Av. Javier Prado, San Isidro');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = pickedCoords?.lat || -12.0965;
    const lng = pickedCoords?.lng || -77.0335;

    onSubmitReport({
      category: selectedCategory,
      title: `${CATEGORIES.find(c => c.id === selectedCategory)?.label} reportado`,
      description: description || 'Reporte de incidente vial verificado por la comunidad ciclista.',
      locationName: locationText,
      lat,
      lng,
      votesConfirm: 1,
      votesReject: 0,
      requiredVotes: 3,
      status: 'PENDING',
      authorName: 'Tú (Ciclista Activo)',
      authorReputation: 15,
      expiresInMinutes: 60,
      imageUrl: photoPreview || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-outline-variant/30 flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                Reportar Incidencia
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Alerta a la comunidad ciclista en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 5-Step Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Step 1: Category */}
          <div>
            <label className="block font-label-md text-xs uppercase tracking-wider text-outline font-semibold mb-2">
              1. Tipo de obstáculo o riesgo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">{cat.icon}</span>
                    <span className="font-label-sm text-[11px] leading-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label-md text-xs uppercase tracking-wider text-outline font-semibold">
                2. Ubicación exacta
              </label>
              <span className="text-[11px] text-primary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[13px]">my_location</span> GPS activo
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                location_on
              </span>
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Dirección o punto de referencia en Lima"
                className="w-full h-11 pl-9 pr-28 bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm rounded-xl outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-transparent focus:border-primary/20"
              />
              <button
                type="button"
                onClick={() => {
                  onTriggerMapPicker();
                  onClose();
                }}
                className="absolute right-1.5 px-3 py-1 bg-surface-container hover:bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">map</span>
                <span>Fijar mapa</span>
              </button>
            </div>
            {pickedCoords && (
              <span className="text-[10px] text-primary mt-1 block">
                Coordenadas fijadas: {pickedCoords.lat.toFixed(4)}, {pickedCoords.lng.toFixed(4)}
              </span>
            )}
          </div>

          {/* Step 3: Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label-md text-xs uppercase tracking-wider text-outline font-semibold">
                3. Breve detalle <span className="font-normal lowercase">(opcional)</span>
              </label>
              <span className="text-[11px] text-outline">{description.length}/120</span>
            </div>
            <textarea
              maxLength={120}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el estado de la ciclovía (ej. bache con agua, carril invadido)..."
              className="w-full p-2.5 bg-surface-container-low text-on-surface font-body-md text-xs sm:text-sm rounded-xl outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-transparent focus:border-primary/20 resize-none"
            />
          </div>

          {/* Step 4: Photo Dropzone */}
          <div>
            <label className="block font-label-md text-xs uppercase tracking-wider text-outline font-semibold mb-1.5">
              4. Fotografía de evidencia <span className="font-normal lowercase">(opcional)</span>
            </label>
            <label className="cursor-pointer bg-surface-container-low hover:bg-surface-container rounded-xl p-3 flex items-center justify-center gap-3 transition-colors border border-dashed border-outline-variant">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-on-surface">Subir foto o capturar</p>
                <p className="text-[10px] text-outline">JPG o PNG de hasta 5MB</p>
              </div>
            </label>
            {photoPreview && (
              <div className="mt-2 relative inline-block">
                <img src={photoPreview} alt="Evidencia" className="h-16 w-24 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-1.5 -right-1.5 bg-error text-white rounded-full p-0.5 text-xs shadow-sm"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 5: Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-semibold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              <span>Publicar Reporte para la Comunidad</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReportarIncidenciaModal;
