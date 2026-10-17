export type IncidentCategory = 'bache' | 'obras' | 'bloqueo' | 'iluminacion' | 'otro';

export type IncidentStatus = 'PENDING' | 'DISPUTED' | 'CONFIRMED' | 'RESOLVED';

export interface Incident {
  id: string;
  category: IncidentCategory;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  votesConfirm: number;
  votesReject: number;
  requiredVotes: number;
  status: IncidentStatus;
  authorName: string;
  authorReputation: number;
  imageUrl?: string;
  createdAt: string;
  expiresInMinutes: number;
}

export interface CycleWay {
  id: string;
  name: string;
  type: 'segregada' | 'vias30';
  coordinates: [number, number][];
  distanceKm: number;
  surface: string;
  safetyScore: number;
}

export interface PlannedRoute {
  originName: string;
  destName: string;
  originCoords: [number, number];
  destCoords: [number, number];
  path: [number, number][];
  distanceKm: number;
  estimatedMinutes: number;
  elevationGainMeters: number;
  safetyPercentage: number;
  surfaceType: string;
  trafficLevel: 'Bajo' | 'Moderado' | 'Alto';
}
