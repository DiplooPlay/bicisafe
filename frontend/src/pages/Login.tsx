import React, { useState } from 'react';
import { useSesion } from '../hooks/useSesion';
import type { ApiError } from '../services/api';

interface LoginProps {
  /** Triggered after a successful login so the app can navigate. */
  onLoginSuccess: (correo: string) => void;
  onNavigateToRegister?: () => void;
  onGuestAccess?: () => void;
}

interface ErroresFormulario {
  correo?: string;
  password?: string;
  general?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * E1 login screen. Validates next to each field, calls the auth API and shows
 * the backend messages (wrong credentials, unverified account) as form-level errors.
 */
export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const { iniciarSesion, cargando } = useSesion();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ErroresFormulario>({});

  const validateInputs = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};
    if (!correo.trim()) {
      nuevosErrores.correo = 'Ingresa tu correo electrónico.';
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.';
    }
    if (!password) nuevosErrores.password = 'Ingresa tu contraseña.';
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setErrors({});
    try {
      const usuario = await iniciarSesion({ correo: correo.trim().toLowerCase(), password });
      onLoginSuccess(usuario.correo);
    } catch (error) {
      const apiError = error as ApiError;
      // Backend field errors land next to their input; business errors show as a banner.
      setErrors({
        correo: apiError.errores?.correo,
        password: apiError.errores?.password,
        general: apiError.status === 0 || apiError.status >= 400 ? apiError.message : undefined,
      });
    }
  };

  const inputErrorClass = (campo: keyof ErroresFormulario) =>
    errors[campo] ? 'ring-2 ring-error focus:ring-error' : '';

  return (
    <div className="w-full min-h-screen bg-background flex flex-col justify-between antialiased">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-[1200px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
          <img src="/logo.svg" alt="BiciSafe Logo" className="h-8 object-contain" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-primary font-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Red Activa 24/7
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-20 pb-12 flex items-center justify-center">
        <div className="max-w-[1200px] w-full mx-auto px-margin-mobile lg:px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-xl items-stretch">

            {/* Left Column: Authentication Form */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10 border border-outline-variant/30">
                {/* Header Context */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                    Acceso Seguro
                  </span>
                </div>

                <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight mb-2">
                  Iniciar Sesión
                </h1>
                <p className="font-body-md text-sm sm:text-base text-on-surface-variant mb-6">
                  Accede a tu cuenta de ciclista urbano y gestiona tus rutas seguras en tiempo real.
                </p>

                {errors.general && (
                  <div className="mb-4 p-3 bg-error-container/40 border border-error/40 text-error rounded-xl font-label-md text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">error</span>
                    {errors.general}
                  </div>
                )}

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  {/* Email Field */}
                  <div>
                    <label className="block font-label-md text-xs sm:text-sm text-on-surface font-semibold mb-1.5" htmlFor="email">
                      Correo Electrónico
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[20px]">
                        mail
                      </span>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="ciclista@ejemplo.com"
                        className={`w-full h-12 pl-11 pr-4 bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-sm rounded-full outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_rgba(0,105,72,0.12)] transition-all border border-transparent focus:border-primary/30 ${inputErrorClass('correo')}`}
                      />
                    </div>
                    {errors.correo && (
                      <p className="mt-1.5 ml-2 font-body-sm text-[11px] text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {errors.correo}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block font-label-md text-xs sm:text-sm text-on-surface font-semibold mb-1.5" htmlFor="password">
                      Contraseña
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[20px]">
                        lock
                      </span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full h-12 pl-11 pr-11 bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-sm rounded-full outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_rgba(0,105,72,0.12)] transition-all border border-transparent focus:border-primary/30 ${inputErrorClass('password')}`}
                      />
                      <button
                        type="button"
                        aria-label="Mostrar u ocultar contraseña"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-outline hover:text-on-surface p-1 rounded-full transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 ml-2 font-body-sm text-[11px] text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full h-12 mt-2 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm sm:text-base font-semibold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
                  >
                    <span>{cargando ? 'Iniciando...' : 'Iniciar Sesión'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </form>

                {/* Register Footer */}
                <div className="mt-6 pt-4 border-t border-surface-container-high flex items-center justify-center gap-1.5 bg-surface-container-low/50 rounded-xl p-3">
                  <span className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                    ¿No tienes una cuenta aún?
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="font-label-md text-xs sm:text-sm text-primary hover:text-primary-container font-semibold transition-colors"
                  >
                    Regístrate gratis
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Community Panel (Hidden on small mobile, visible on lg) */}
            <div className="hidden lg:flex lg:col-span-6 flex-col">
              <div className="h-full bg-surface-container-low rounded-2xl p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">

                {/* Decorative Ambient Background Blurs */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-secondary/10 blur-2xl pointer-events-none"></div>

                {/* Top Badge & Verification */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface-container-lowest shadow-sm rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                      Red Ciclista Protegida
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                    <span>Comunidad Verificada</span>
                  </div>
                </div>

                {/* Center Route Radar Mockup */}
                <div className="relative z-10 my-6 flex flex-col gap-4">
                  <div className="relative rounded-2xl overflow-hidden bg-surface-container shadow-md h-56 flex flex-col justify-between p-5 border border-white/20">
                    {/* Background vector stylized map */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-slate-900/80 to-teal-950">
                      {/* Stylized cycling lines */}
                      <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none">
                        <path d="M 20 180 Q 150 40 260 120 T 380 30" stroke="#85f8c4" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 60 20 L 140 180 L 320 140" stroke="#5bb8fe" strokeWidth="4" strokeDasharray="6 6" />
                        <circle cx="260" cy="120" r="8" fill="#85f8c4" />
                        <circle cx="150" cy="75" r="6" fill="#ffffff" />
                      </svg>
                    </div>

                    {/* Top Floating Telemetry Indicator */}
                    <div className="relative z-10 self-start inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest/95 backdrop-blur-md rounded-full shadow-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">alt_route</span>
                      <span className="font-label-sm text-xs text-on-surface font-semibold">
                        Eje Ciclista Metropolitano — 99.4% Seguro
                      </span>
                    </div>

                    {/* Bottom Route Summary */}
                    <div className="relative z-10 flex items-end justify-between text-white">
                      <div>
                        <p className="font-label-sm text-xs text-white/80">Tramo Recomendado</p>
                        <p className="font-headline-sm text-lg font-bold text-white">Ciclovía Segregada Activa</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/90 text-on-primary px-3 py-1 rounded-full font-label-sm text-xs font-semibold shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                        <span>Sin incidentes hoy</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Community Telemetry Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex flex-col border border-outline-variant/30">
                      <div className="flex items-center justify-between text-outline mb-1">
                        <span className="font-label-sm text-[11px] font-semibold">CICLISTAS</span>
                        <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                      </div>
                      <span className="font-metric-val text-xl text-on-surface font-bold tracking-tight">+15.4k</span>
                      <span className="font-body-sm text-xs text-primary flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">trending_up</span> Activos hoy
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex flex-col border border-outline-variant/30">
                      <div className="flex items-center justify-between text-outline mb-1">
                        <span className="font-label-sm text-[11px] font-semibold">RUTAS</span>
                        <span className="material-symbols-outlined text-[16px] text-secondary">map</span>
                      </div>
                      <span className="font-metric-val text-xl text-on-surface font-bold tracking-tight">342 km</span>
                      <span className="font-body-sm text-xs text-secondary flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Verificadas
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex flex-col border border-outline-variant/30">
                      <div className="flex items-center justify-between text-outline mb-1">
                        <span className="font-label-sm text-[11px] font-semibold">CONFIANZA</span>
                        <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      </div>
                      <span className="font-metric-val text-xl text-on-surface font-bold tracking-tight">98.7%</span>
                      <span className="font-body-sm text-xs text-tertiary flex items-center gap-0.5 mt-0.5 font-medium">
                        <span className="material-symbols-outlined text-[12px]">favorite</span> Consenso
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Assurance Note */}
                <div className="relative z-10 flex items-center justify-between text-xs text-on-surface-variant pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">lock_clock</span>
                    <span>Tus trayectos y reportes están cifrados de extremo a extremo</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-outline border-t border-surface-container">
        <p>© 2026 BiciSafe. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Login;
