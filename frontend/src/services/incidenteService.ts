import { Incident, IncidentCategory, IncidentStatus } from '../types';
import { INITIAL_INCIDENTS } from './mockData';

const RAW_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BASE_URL = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL.replace(/\/$/, '')}/api`;

/**
 * Service handling incident fetching, reporting, and consensus voting.
 * Communicates with Spring Boot backend with automatic offline resiliency.
 */
export async function fetchIncidentesActivos(): Promise<Incident[]> {
  try {
    const res = await fetch(`${BASE_URL}/incidentes/activos`);
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const data = await res.json();
    return data.map(mapDtoToIncident);
  } catch (err) {
    console.warn('Backend /incidentes/activos no respondió; usando almacenamiento local resiliente.');
    return INITIAL_INCIDENTS.filter(i => i.status !== 'RESOLVED' && i.status !== 'EXPIRED');
  }
}

export async function fetchTodosIncidentes(): Promise<Incident[]> {
  try {
    const res = await fetch(`${BASE_URL}/incidentes`);
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const data = await res.json();
    return data.map(mapDtoToIncident);
  } catch (err) {
    console.warn('Backend /incidentes no respondió; usando almacenamiento local resiliente.');
    return INITIAL_INCIDENTS;
  }
}

export async function reportarIncidenteApi(
  payload: Omit<Incident, 'id' | 'createdAt'>,
  token?: string | null
): Promise<Incident> {
  const jwt = token || localStorage.getItem('bicisafe.token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const res = await fetch(`${BASE_URL}/incidentes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      categoria: payload.category.toUpperCase(),
      titulo: payload.title,
      descripcion: payload.description,
      ubicacionTexto: payload.locationName,
      latitud: payload.lat,
      longitud: payload.lng,
      fotoUrl: payload.imageUrl || null
    })
  });

  if (!res.ok) {
    let mensaje = `Error HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.mensaje) mensaje = errJson.mensaje;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(mensaje);
  }

  const data = await res.json();
  return mapDtoToIncident(data);
}

export async function confirmarIncidenteApi(id: string, token?: string | null): Promise<void> {
  const jwt = token || localStorage.getItem('bicisafe.token');
  const headers: Record<string, string> = {};
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }
  const res = await fetch(`${BASE_URL}/incidentes/${id}/confirmar`, { method: 'POST', headers });
  if (!res.ok) {
    let mensaje = `Error al confirmar (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.mensaje) mensaje = errJson.mensaje;
    } catch {
      // ignore
    }
    throw new Error(mensaje);
  }
}

export async function resolverIncidenteApi(id: string, token?: string | null): Promise<void> {
  const jwt = token || localStorage.getItem('bicisafe.token');
  const headers: Record<string, string> = {};
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }
  const res = await fetch(`${BASE_URL}/incidentes/${id}/resolver`, { method: 'POST', headers });
  if (!res.ok) {
    let mensaje = `Error al resolver (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.mensaje) mensaje = errJson.mensaje;
    } catch {
      // ignore
    }
    throw new Error(mensaje);
  }
}

/** Reports an inappropriate, fake or duplicate incident (HU-14). */
export async function denunciarIncidenteApi(id: string, motivo: string, comentario?: string): Promise<void> {
  const token = localStorage.getItem('bicisafe.token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}/incidentes/${id}/denunciar`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ motivo, comentario })
  });
  if (!res.ok) {
    let mensaje = `Error al denunciar (${res.status})`;
    try {
      const data = await res.json();
      if (data?.mensaje) mensaje = data.mensaje;
    } catch {
      // ignore JSON parse failures
    }
    throw new Error(mensaje);
  }
}

/** Fetches active incidents that intersect a route path (HU-09). */
export async function fetchIncidentesEnRuta(puntos: [number, number][], radioMetros = 150): Promise<Incident[]> {
  try {
    const res = await fetch(`${BASE_URL}/incidentes/en-ruta?radioMetros=${radioMetros}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(puntos)
    });
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const data = await res.json();
    return data.map(mapDtoToIncident);
  } catch (err) {
    // Resilient local filter
    return INITIAL_INCIDENTS.filter(i => {
      if (i.status === 'RESOLVED' || i.status === 'EXPIRED') return false;
      return puntos.some(([lat, lng]) => {
        const dLat = Math.abs(lat - i.lat);
        const dLng = Math.abs(lng - i.lng);
        return dLat < 0.002 && dLng < 0.002;
      });
    });
  }
}

export function normalizarEstado(estado?: string): IncidentStatus {
  if (!estado) return 'PENDING';
  const e = estado.toUpperCase();
  if (e === 'PENDIENTE' || e === 'PENDING') return 'PENDING';
  if (e === 'EN_DISPUTA' || e === 'DISPUTED') return 'DISPUTED';
  if (e === 'CONFIRMADO' || e === 'CONFIRMED') return 'CONFIRMED';
  if (e === 'RESUELTO' || e === 'RESOLVED') return 'RESOLVED';
  if (e === 'EXPIRADO' || e === 'EXPIRED') return 'EXPIRED';
  return 'PENDING';
}

export function mapDtoToIncident(dto: any): Incident {
  return {
    id: dto.id?.toString() || `inc-${Date.now()}`,
    category: (dto.categoria || 'otro').toLowerCase() as IncidentCategory,
    title: dto.titulo || 'Incidente vial',
    description: dto.descripcion || '',
    locationName: dto.ubicacionTexto || 'Lima',
    lat: dto.latitud,
    lng: dto.longitud,
    votesConfirm: dto.votosConfirmar || 1,
    votesReject: dto.votosRechazar || 0,
    requiredVotes: dto.votosRequeridos || 3,
    status: normalizarEstado(dto.estado),
    authorName: dto.autorNombre || 'Ciclista Urbano',
    authorReputation: dto.autorReputacion || 15,
    imageUrl: dto.fotoUrl || undefined,
    createdAt: dto.fechaCreacion ? new Date(dto.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
    expiresInMinutes: dto.minutosRestantes !== undefined ? dto.minutosRestantes : 60
  };
}
