import React, { useEffect, useRef, useState } from 'react';
import { useSesion } from '../hooks/useSesion';

interface VerificarCorreoProps {
  /** Confirmation token obtained from the emailed link (?token=...). */
  token: string;
  onNavigateToLogin: () => void;
}

type EstadoVerificacion = 'loading' | 'success' | 'error';

/**
 * E1 email verification screen: target of the emailed link. Confirms the token once
 * (StrictMode runs effects twice) and tells the user the next step.
 */
export const VerificarCorreo: React.FC<VerificarCorreoProps> = ({ token, onNavigateToLogin }) => {
  const { verificarCorreoConfirmacion, cargando } = useSesion();
  const [estado, setEstado] = useState<EstadoVerificacion>('loading');
  const [mensaje, setMensaje] = useState('Estamos confirmando tu cuenta...');
  const yaConfirmado = useRef(false);

  useEffect(() => {
    if (yaConfirmado.current) return;
    yaConfirmado.current = true;

    verificarCorreoConfirmacion(token)
      .then((respuesta) => {
        setEstado('success');
        setMensaje(respuesta.mensaje);
      })
      .catch((error: any) => {
        setEstado('error');
        setMensaje(error?.message ?? 'No se pudo confirmar tu correo. Intenta de nuevo.');
      });
  }, [token, verificarCorreoConfirmacion]);

  const icono = estado === 'success' ? 'mark_email_read' : estado === 'error' ? 'error' : 'hourglass_top';
  const colorIcono = estado === 'success' ? 'bg-primary/10 text-primary' : estado === 'error' ? 'bg-error/10 text-error' : 'bg-surface-container text-on-surface-variant';

  return (
    <div className="w-full min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 text-center">
        <div className={`w-14 h-14 mx-auto rounded-full ${colorIcono} flex items-center justify-center mb-4`}>
          <span className={`material-symbols-outlined text-[28px] ${estado === 'loading' ? 'animate-pulse' : ''}`}>
            {icono}
          </span>
        </div>
        <h1 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">Verificación de correo</h1>
        <p className="font-body-md text-sm text-on-surface-variant mb-6">{mensaje}</p>
        <button
          type="button"
          disabled={cargando || estado === 'loading'}
          onClick={onNavigateToLogin}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-semibold rounded-full shadow-md transition-all cursor-pointer disabled:opacity-70"
        >
          Ir a iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default VerificarCorreo;
