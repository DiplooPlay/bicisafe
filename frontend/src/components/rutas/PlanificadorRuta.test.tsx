import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanificadorRuta } from './PlanificadorRuta';

describe('PlanificadorRuta component', () => {
  it('permite escribir el destino y usar el botón de ubicación GPS', () => {
    const handleRouteCalculated = vi.fn();
    const handleRoutingError = vi.fn();
    const handleUseCurrentLocation = vi.fn();

    render(
      <PlanificadorRuta
        onRouteCalculated={handleRouteCalculated}
        onRoutingError={handleRoutingError}
        userCoords={[-12.12, -77.03]}
        onUseCurrentLocation={handleUseCurrentLocation}
      />
    );

    const gpsButton = screen.getByRole('button', { name: /Usar mi GPS/i });
    expect(gpsButton).toBeInTheDocument();

    fireEvent.click(gpsButton);
    expect(handleUseCurrentLocation).toHaveBeenCalled();

    const destinoInput = screen.getByPlaceholderText(/Ovalo Higuereta/i);
    expect(destinoInput).toBeInTheDocument();

    fireEvent.change(destinoInput, { target: { value: 'Av. Arequipa' } });
    expect((destinoInput as HTMLInputElement).value).toBe('Av. Arequipa');
  });
});
