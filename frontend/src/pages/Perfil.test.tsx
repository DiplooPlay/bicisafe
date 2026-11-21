import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Perfil } from './Perfil';
import * as apiModule from '../services/api';
import * as authService from '../services/auth';

const mockUsuario = {
  id: 'usr-1',
  correo: 'pedro@correo.com',
  nombre: 'Pedro Ciclista',
  rol: 'CICLISTA',
  estado: 'ACTIVO',
  reputacion: 20,
};

const mockSesion = {
  token: 'fake-jwt-token',
  usuario: mockUsuario,
};

vi.mock('../services/api', () => ({
  peticionApi: vi.fn(),
  ApiError: class ApiError extends Error {},
}));

vi.mock('../context/SesionContext', () => ({
  useSesion: () => mockSesion,
}));

vi.mock('../hooks/useSesion', () => ({
  useSesion: () => mockSesion,
}));

describe('Perfil (HU-04)', () => {
  const mockBackendResponse = {
    id: 'usr-1',
    correo: 'pedro@correo.com',
    nombre: 'Pedro Ciclista',
    rol: 'CICLISTA',
    reputacion: 25,
    totalReportes: 1,
    fechaRegistro: '2026-11-20T10:00:00Z',
    historialReportes: [
      {
        id: 'inc-100',
        categoria: 'BACHE',
        titulo: 'Bache peligroso en ciclo vía',
        descripcion: 'Hondo',
        ubicacionTexto: 'Av. Revolución con Central',
        latitud: -12.2,
        longitud: -76.9,
        votosConfirmar: 3,
        votosRechazar: 0,
        votosRequeridos: 3,
        estado: 'CONFIRMADO',
        autorNombre: 'Pedro Ciclista',
        autorReputacion: 25,
        fechaCreacion: '2026-11-20T10:00:00Z',
        minutosRestantes: 50,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mapea correctamente los campos del backend (titulo → title, estado → status) en obtenerPerfilCompleto', async () => {
    vi.mocked(apiModule.peticionApi).mockResolvedValue(mockBackendResponse as any);

    const perfil = await authService.obtenerPerfilCompleto('test-token');
    expect(perfil.historialReportes[0].title).toBe('Bache peligroso en ciclo vía');
    expect(perfil.historialReportes[0].locationName).toBe('Av. Revolución con Central');
    expect(perfil.historialReportes[0].status).toBe('CONFIRMED');
  });

  it('renderiza correctamente el perfil y los reportes mapeados en pantalla', async () => {
    vi.mocked(apiModule.peticionApi).mockResolvedValue(mockBackendResponse as any);

    render(
      <Perfil
        onVolverAlMapa={vi.fn()}
        onLogout={vi.fn()}
        showNotification={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Pedro Ciclista')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    expect(screen.getByText('Bache peligroso en ciclo vía')).toBeInTheDocument();
    expect(screen.getByText('Av. Revolución con Central')).toBeInTheDocument();
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });
});
