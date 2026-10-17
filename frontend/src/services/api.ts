/**
 * Small fetch wrapper for the BiciSafe REST API.
 *
 * Responsibilities:
 * - Injects the base URL and the JSON/Bearer headers.
 * - Translates backend error bodies ({ mensaje, errores }) into typed exceptions so
 *   pages can render field-level errors next to their inputs.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** Error thrown for any non-2xx API response. */
export class ApiError extends Error {
  /** HTTP status code. */
  readonly status: number;
  /** Per-field errors keyed by field name (e.g. `{ correo: '...' }`), when provided. */
  readonly errores?: Record<string, string>;

  constructor(status: number, mensaje: string, errores?: Record<string, string>) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.errores = errores;
  }
}

interface OpcionesPeticion {
  path: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

/** Performs a request and parses the JSON body; throws {@link ApiError} on failure. */
export async function peticionApi<T>({ path, method = 'GET', body, token, signal }: OpcionesPeticion): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión.');
  }
  return procesarRespuesta<T>(respuesta);
}

/** Behavior shared by all modules: silent 204 or JSON body, or typed error. */
async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (respuesta.ok) {
    return respuesta.status === 204 ? (undefined as T) : ((await respuesta.json()) as T);
  }

  let mensaje = `Error inesperado (HTTP ${respuesta.status}).`;
  let errores: Record<string, string> | undefined;
  try {
    const cuerpo = (await respuesta.json()) as { mensaje?: string; errores?: Record<string, string> };
    if (typeof cuerpo.mensaje === 'string') mensaje = cuerpo.mensaje;
    if (cuerpo.errores && typeof cuerpo.errores === 'object') errores = cuerpo.errores;
  } catch {
    // The body is not JSON (e.g. a gateway error); keep the generic message.
  }
  throw new ApiError(respuesta.status, mensaje, errores);
}
