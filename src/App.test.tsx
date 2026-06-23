import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';
import { AppProvider } from './context/AppContext';

function renderApp() {
  return render(
    <AppProvider>
      <App />
    </AppProvider>,
  );
}

describe('App', () => {
  it('mostra la schermata Cerca per impostazione predefinita', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Trova l’alloggio' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Link dell’annuncio/i)).toBeInTheDocument();
  });

  it('naviga alla sezione Confronta mostrando lo stato vuoto', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Confronta/i }));
    expect(screen.getByText(/Nessun alloggio salvato/i)).toBeInTheDocument();
  });

  it('cambia lingua in inglese', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Switch language/i }));
    expect(screen.getByRole('heading', { name: 'Find the rental' })).toBeInTheDocument();
  });
});
