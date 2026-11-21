import React, { useState } from 'react';
import { useSesion } from '../hooks/useSesion';
import type { ApiError } from '../services/api';

interface LoginProps {
  /** Triggered after a successful login so the app can navigate. */
  onLoginSuccess: (correo: string) => void;
  onNavigateToRegister?: () => void;
  onNavigateToRecover?: () => void;
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
export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister, onNavigateToRecover }) => {
  const { iniciarSesion, cargando } = useSesion();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ErroresFormulario>({});

  const validateInputs = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};
    if (!correo.trim()) {
      nuevosErrores.correo = 'Ingresa tu correo.';
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      nuevosErrores.correo = 'Correo no válido.';
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
        <div className="h-16 max-w-[1200px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between">
          <img src="/logo.svg" alt="BiciSafe Logo" className="h-8 object-contain" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-24 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-margin-mobile">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 border border-outline-variant/30">
            
            <h1 className="font-headline-lg text-2xl text-on-surface font-bold tracking-tight mb-1">
              Iniciar sesión
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mb-6">
              Acceso a tu cuenta
            </p>

            {errors.general && (
              <div className="mb-4 p-3 bg-error-container/40 border border-error/40 text-error rounded-xl font-label-md text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div>
                <label className="block font-label-md text-xs text-on-surface font-semibold mb-1.5" htmlFor="email">
                  Correo
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
                    <span>{errors.correo}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-label-md text-xs text-on-surface font-semibold mb-1.5" htmlFor="password">
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
                    placeholder="••••••••"
                    className={`w-full h-12 pl-11 pr-11 bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-sm rounded-full outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_rgba(0,105,72,0.12)] transition-all border border-transparent focus:border-primary/30 ${inputErrorClass('password')}`}
                  />
                  <button
                    type="button"
                    aria-label="Mostrar u ocultar contraseña"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-outline hover:text-on-surface p-1 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 ml-2 font-body-sm text-[11px] text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              {onNavigateToRecover && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onNavigateToRecover}
                    className="font-label-md text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full h-12 mt-2 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-semibold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
              >
                <span>{cargando ? 'Iniciando...' : 'Iniciar sesión'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>

            {/* Register Footer */}
            {onNavigateToRegister && (
              <div className="mt-6 pt-4 border-t border-surface-container-high flex items-center justify-center gap-1.5 bg-surface-container-low/50 rounded-xl p-3">
                <span className="font-body-sm text-xs text-on-surface-variant">
                  ¿No tienes cuenta?
                </span>
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-label-md text-xs text-primary hover:text-primary-container font-semibold transition-colors cursor-pointer"
                >
                  Regístrate
                </button>
              </div>
            )}
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
