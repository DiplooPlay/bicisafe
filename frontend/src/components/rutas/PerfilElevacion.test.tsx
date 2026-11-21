import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PerfilElevacion } from './PerfilElevacion';

describe('PerfilElevacion component', () => {
  it('muestra el gráfico de perfil de altitud y la ganancia de elevación (HU-08)', () => {
    const perfilMock = [
      { distanciaKm: 0, elevacionMetros: 50 },
      { distanciaKm: 2.5, elevacionMetros: 95 },
      { distanciaKm: 5.0, elevacionMetros: 80 },
    ];

    render(
      <PerfilElevacion
        perfil={perfilMock}
        elevacionGanada={45}
        elevacionPerdida={15}
      />
    );

    expect(screen.getByText(/Perfil de Elevación/i)).toBeInTheDocument();
    expect(screen.getByText(/\+45 m/i)).toBeInTheDocument();
    expect(screen.getByText(/-15 m/i)).toBeInTheDocument();
  });

  it('muestra +0 m y -0 m para una ruta plana sin desniveles (HU-08)', () => {
    const perfilPlano = [
      { distanciaKm: 0, elevacionMetros: 50 },
      { distanciaKm: 3.0, elevacionMetros: 50 },
    ];

    render(
      <PerfilElevacion
        perfil={perfilPlano}
        elevacionGanada={0}
        elevacionPerdida={0}
      />
    );

    expect(screen.getByText(/\+0 m/i)).toBeInTheDocument();
    expect(screen.getByText(/-0 m/i)).toBeInTheDocument();
  });
});
