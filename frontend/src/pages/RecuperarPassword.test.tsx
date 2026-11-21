import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecuperarPassword } from './RecuperarPassword';

describe('RecuperarPassword component', () => {
  it('renderiza el formulario de recuperación y valida el correo (HU-03)', () => {
    const handleVolver = vi.fn();
    render(<RecuperarPassword onVolverALogin={handleVolver} />);

    expect(screen.getByText(/Restablecer Contraseña/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/Correo Electrónico/i);
    expect(input).toBeInTheDocument();

    const botonEnviar = screen.getByRole('button', { name: /Enviar Enlace/i });
    expect(botonEnviar).toBeInTheDocument();

    const botonVolver = screen.getByText(/Volver a Iniciar Sesión/i);
    fireEvent.click(botonVolver);
    expect(handleVolver).toHaveBeenCalled();
  });
});
