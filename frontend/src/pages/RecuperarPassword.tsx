import React, { useState } from 'react';
import { solicitarRecuperacionPassword } from '../services/auth';
import type { ApiError } from '../services/api';

interface RecuperarPasswordProps {
  onVolverALogin: () => void;
  onEnlaceEnviado?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RecuperarPassword: React.FC<RecuperarPasswordProps> = ({ onVolverALogin }) => {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    const correoLimpio = correo.trim().toLowerCase();
    if (!correoLimpio) {
      setError('Ingresa tu correo.');
      return;
    }
    if (!EMAIL_REGEX.test(correoLimpio)) {
      setError('Correo no válido.');
      return;
    }

    setCargando(true);
    try {
      const res = await solicitarRecuperacionPassword({ correo: correoLimpio });
      setMensajeExito(res.mensaje || 'Enlace enviado.');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al enviar.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">
        
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          </span>
          <span className="font-label-md text-xs uppercase tracking-wider text-primary font-bold">
            Recuperar Cuenta
          </span>
        </div>

        <h1 className="font-headline-sm text-xl font-bold text-on-surface mb-2">
          Restablecer Contraseña
        </h1>
        <p className="font-body-sm text-xs text-on-surface-variant mb-6">
          Te enviaremos un enlace válido por 15 minutos para crear una nueva clave.
        </p>

        {mensajeExito && (
          <div className="mb-4 p-3.5 bg-primary/10 border border-primary/30 text-primary rounded-xl font-body-sm text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{mensajeExito}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-error-container/40 border border-error/40 text-error rounded-xl font-body-sm text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo-recuperar" className="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[18px]">
                mail
              </span>
              <input
                id="correo-recuperar"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ciclista@ejemplo.com"
                required
                className="w-full h-11 pl-10 pr-4 bg-surface-container-low text-on-surface font-body-md text-xs rounded-full outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <span>{cargando ? 'Enviando...' : 'Enviar Enlace'}</span>
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>

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

export default RecuperarPassword;
