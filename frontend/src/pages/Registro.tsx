import React, { useState } from 'react';
import { registrar } from '../services/auth';

interface RegistroProps {
  /** Triggered once the account is created, so the app can navigate (e.g. to login). */
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

interface ErroresFormulario {
  nombre?: string;
  correo?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * E1 registration screen: validates the input next to each field, calls the auth API
 * and explains that the account becomes active after confirming the emailed link.
 */
export const Registro: React.FC<RegistroProps> = ({ onSuccess, onNavigateToLogin }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErroresFormulario>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const validateInputs = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};
    if (!nombre.trim()) nuevosErrores.nombre = 'Ingresa tu nombre.';
    if (!correo.trim()) {
      nuevosErrores.correo = 'Ingresa tu correo electrónico.';
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.';
    }
    if (!password) {
      nuevosErrores.password = 'Ingresa una contraseña.';
    } else if (password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    setMensajeExito(null);
    try {
      // New registration -> the backend sends the confirmation email; no session yet.
      const respuesta = await registrar({
        correo: correo.trim().toLowerCase(),
        password,
        nombre: nombre.trim(),
      });
      setMensajeExito(respuesta.mensaje);
    } catch (error: any) {
      // Field errors from the API (e.g. duplicate email) land next to their input.
      const erroresApi = error?.errores ?? {};
      setErrors({
        nombre: erroresApi.nombre,
        correo: erroresApi.correo ?? (error?.status ? undefined : 'No se pudo conectar con el servidor.'),
        password: erroresApi.password,
      });
      setMensajeExito(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (mensajeExito) {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">Confirma tu correo</h1>
          <p className="font-body-md text-sm text-on-surface-variant mb-6">{mensajeExito}</p>
          <p className="font-body-sm text-xs text-outline mb-6">
            La cuenta queda activa cuando confirmes el enlace. Si no lo ves, revisa tu carpeta de spam.
          </p>
          <button
            type="button"
            onClick={onSuccess}
            className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm font-semibold rounded-full shadow-md transition-all cursor-pointer"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  const renderError = (campo: keyof ErroresFormulario) =>
    errors[campo] && (
      <p className="mt-1.5 ml-2 font-body-sm text-[11px] text-error flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">error</span>
        {errors[campo]}
      </p>
    );

  const inputClass =
    'w-full h-12 pl-11 pr-4 bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-sm rounded-full outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:shadow-[0_0_0_3px_rgba(0,105,72,0.12)] transition-all border border-transparent focus:border-primary/30';

  return (
    <div className="w-full min-h-screen bg-background flex flex-col justify-between antialiased">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-[1200px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
          <img src="/logo.svg" alt="BiciSafe Logo" className="h-8 object-contain" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-primary font-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Red Activa 24/7
          </span>
        </div>
      </header>

      <main className="w-full flex-1 pt-24 pb-12 flex items-start md:items-center justify-center">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[16px]">person_add</span>
            </span>
            <span className="font-label-sm uppercase tracking-wider text-primary font-semibold">
              Acceso Seguro
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight mb-2">
            Crear Cuenta
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mb-6">
            Regístrate con tu correo para reportar y validar incidentes en tu ruta.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block font-label-md text-xs sm:text-sm text-on-surface font-semibold mb-1.5" htmlFor="nombre">
                Nombre
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[20px]">
                  person
                </span>
                <input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className={inputClass}
                />
              </div>
              {renderError('nombre')}
            </div>

            <div>
              <label className="block font-label-md text-xs sm:text-sm text-on-surface font-semibold mb-1.5" htmlFor="registro-correo">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[20px]">
                  mail
                </span>
                <input
                  id="registro-correo"
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ciclista@ejemplo.com"
                  className={inputClass}
                />
              </div>
              {renderError('correo')}
            </div>

            <div>
              <label className="block font-label-md text-xs sm:text-sm text-on-surface font-semibold mb-1.5" htmlFor="registro-password">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none text-[20px]">
                  lock
                </span>
                <input
                  id="registro-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`${inputClass} pr-11`}
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
              {renderError('password')}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-sm sm:text-base font-semibold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
            >
              <span>{isLoading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-container-high flex items-center justify-center gap-1.5 bg-surface-container-low/50 rounded-xl p-3">
            <span className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              ¿Ya tienes una cuenta?
            </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-label-md text-xs sm:text-sm text-primary hover:text-primary-container font-semibold transition-colors"
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-outline border-t border-surface-container">
        <p>© 2026 BiciSafe. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Registro;
