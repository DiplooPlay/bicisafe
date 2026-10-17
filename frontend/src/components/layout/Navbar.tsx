import React from 'react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  usuario?: { correo: string | null; nombre: string | null } | null;
  userEmail?: string | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, usuario, userEmail, onLogout }) => {
  const emailAMostrar = usuario?.correo || userEmail;
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="h-16 max-w-[1200px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-space-lg">
          <button
            onClick={() => onSelectTab('mapa')}
            className="flex items-center gap-space-xs focus:outline-none cursor-pointer"
          >
            <img src="/logo.svg" alt="BiciSafe Logo" className="h-7 object-contain" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('mapa')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-xs sm:text-sm transition-colors cursor-pointer ${
                currentTab === 'mapa'
                  ? 'bg-surface-container-high text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              Mapa e Incidentes
            </button>
            <button
              onClick={() => onSelectTab('validar')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'validar'
                  ? 'bg-surface-container-high text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span>Validación Comunitaria</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </button>
          </nav>
        </div>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <button
            onClick={() => onSelectTab('reportar')}
            className="hidden sm:inline-flex items-center justify-center h-10 px-4 bg-primary text-on-primary font-label-md text-xs sm:text-sm rounded-full shadow-sm hover:bg-primary-container active:scale-95 transition-all gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            <span>Reportar Incidencia</span>
          </button>

          {emailAMostrar ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline font-body-sm text-xs text-on-surface-variant font-medium max-w-[180px] truncate">
                {usuario?.nombre ?? emailAMostrar}
              </span>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('login')}
              className={`h-9 px-3.5 rounded-full font-label-md text-xs flex items-center gap-1.5 transition-all ${
                currentTab === 'login'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low text-primary hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
