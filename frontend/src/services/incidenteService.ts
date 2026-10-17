import { Incident, IncidentCategory } from '../types';
import { INITIAL_INCIDENTS } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
    return INITIAL_INCIDENTS.filter(i => i.status !== 'RESOLVED');
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
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/incidentes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        categoria: payload.category,
        titulo: payload.title,
        descripcion: payload.description,
        ubicacionTexto: payload.locationName,
        latitud: payload.lat,
        longitud: payload.lng,
        fotoUrl: payload.imageUrl || null
      })
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    const data = await res.json();
    return mapDtoToIncident(data);
  } catch (err) {
    console.warn('Reportando en modo local resiliente debido a backend desconectado:', err);
    return {
      ...payload,
      id: `local-${Date.now()}`,
      createdAt: 'Hace un momento'
    };
  }
}

export async function confirmarIncidenteApi(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('bicisafe.token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    await fetch(`${BASE_URL}/incidentes/${id}/confirmar`, { method: 'POST', headers });
  } catch (err) {
    console.warn(`Confirmación local aplicada para incidente ${id}.`);
  }
}

export async function resolverIncidenteApi(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('bicisafe.token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    await fetch(`${BASE_URL}/incidentes/${id}/resolver`, { method: 'POST', headers });
  } catch (err) {
    console.warn(`Incidente ${id} marcado como resuelto en modo local.`);
  }
}

function mapDtoToIncident(dto: any): Incident {
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
    status: dto.estado || 'PENDING',
    authorName: dto.autorNombre || 'Ciclista Urbano',
    authorReputation: dto.autorReputacion || 15,
    imageUrl: dto.fotoUrl || undefined,
    createdAt: dto.fechaCreacion ? new Date(dto.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
    expiresInMinutes: dto.minutosRestantes !== undefined ? dto.minutosRestantes : 60
  };
}
