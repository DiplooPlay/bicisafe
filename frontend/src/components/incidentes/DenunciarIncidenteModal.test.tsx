import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DenunciarIncidenteModal } from './DenunciarIncidenteModal';

describe('DenunciarIncidenteModal component', () => {
  it('permite seleccionar el motivo de reporte de incidente inapropiado (HU-14)', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <DenunciarIncidenteModal
        isOpen={true}
        incidenteId="inc-123"
        incidenteTitulo="Bache falso"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    expect(screen.getByText(/Denunciar incidente/i)).toBeInTheDocument();
    expect(screen.getByText(/Bache falso/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Falso/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Duplicado/i })).toBeInTheDocument();

    const botonCancelar = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(botonCancelar);
    expect(handleClose).toHaveBeenCalled();
  });
});
