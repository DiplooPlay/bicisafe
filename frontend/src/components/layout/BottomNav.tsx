import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, pendingCount = 2 }) => {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-space-xs">
        
        {/* Mapa */}
        <button
          onClick={() => onSelectTab('mapa')}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-colors cursor-pointer ${
            currentTab === 'mapa' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">map</span>
          <span className="font-label-sm text-[11px]">Mapa</span>
        </button>

        {/* Central Floating Report Button */}
        <button
          onClick={() => onSelectTab('reportar')}
          className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
        >
          <div className="w-13 h-13 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_4px_14px_rgba(0,105,72,0.35)] transition-transform group-active:scale-95">
            <span className="material-symbols-outlined text-[28px]">warning</span>
          </div>
          <span className="font-label-sm text-[11px] text-on-surface-variant mt-1 group-hover:text-primary transition-colors font-medium">
            Reportar
          </span>
        </button>

        {/* Validar */}
        <button
          onClick={() => onSelectTab('validar')}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-colors cursor-pointer relative ${
            currentTab === 'validar' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">how_to_vote</span>
          <span className="font-label-sm text-[11px]">Validar</span>
          {pendingCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-error text-on-error text-[9px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Iniciar Sesión / Perfil */}
        <button
          onClick={() => onSelectTab('login')}
          className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-colors cursor-pointer ${
            currentTab === 'login' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">account_circle</span>
          <span className="font-label-sm text-[11px]">Cuenta</span>
        </button>

      </div>
    </nav>
  );
};

export default BottomNav;
