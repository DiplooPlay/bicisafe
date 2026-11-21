import React, { useState } from 'react';
import { restablecerPassword } from '../services/auth';
import type { ApiError } from '../services/api';

interface RestablecerPasswordProps {
  token: string;
  onSuccess: () => void;
  onVolverALogin: () => void;
}

export const RestablecerPassword: React.FC<RestablecerPasswordProps> = ({
  token,
  onSuccess,
  onVolverALogin,
}) => {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 8) {
      setError('Mínimo 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await restablecerPassword({ token, nuevaPassword });
      setExito(true);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al restablecer.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">
        
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">key</span>
          </span>
          <span className="font-label-md text-xs uppercase tracking-wider text-primary font-bold">
            Nueva Clave
          </span>
        </div>

        <h1 className="font-headline-sm text-xl font-bold text-on-surface mb-2">
          Definir Contraseña
        </h1>
        <p className="font-body-sm text-xs text-on-surface-variant mb-6">
          Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
        </p>

        {exito ? (
          <div className="p-4 bg-primary/10 border border-primary/30 text-primary rounded-xl font-body-sm text-xs flex flex-col gap-2 text-center">
            <span className="material-symbols-outlined text-3xl mx-auto text-primary">check_circle</span>
            <p className="font-bold">¡Contraseña actualizada!</p>
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error-container/40 border border-error/40 text-error rounded-xl font-body-sm text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="nueva-password" className="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[18px]">
                  lock
                </span>
                <input
                  id="nueva-password"
                  type={showPassword ? 'text' : 'password'}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full h-11 pl-10 pr-10 bg-surface-container-low text-on-surface font-body-md text-xs rounded-full outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-outline hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmar-password" className="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[18px]">
                  lock
                </span>
                <input
                  id="confirmar-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  minLength={8}
                  className="w-full h-11 pl-10 pr-4 bg-surface-container-low text-on-surface font-body-md text-xs rounded-full outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{cargando ? 'Guardando...' : 'Guardar Contraseña'}</span>
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-surface-container text-center">
          <button
            type="button"
            onClick={onVolverALogin}
            className="font-label-md text-xs text-primary hover:underline font-semibold cursor-pointer"
          >
            Volver a Iniciar Sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default RestablecerPassword;
