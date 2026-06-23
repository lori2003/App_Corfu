import { describe, it, expect } from 'vitest';
import { buildFallbackQueries } from './geocoding';

describe('buildFallbackQueries', () => {
  it('rimuove il segmento del codice postale', () => {
    const variants = buildFallbackQueries('Olympou, Kavos, 490 80, Grecia');
    expect(variants).toContain('Olympou, Kavos, Grecia');
  });

  it('prova singolarmente le due varianti di nome separate da " - "', () => {
    const variants = buildFallbackQueries(
      'Ολύμπου - Olympou, Kavos, 490 80, Grecia',
    );
    expect(variants).toContain('Olympou, Kavos, Grecia');
    expect(variants).toContain('Ολύμπου, Kavos, Grecia');
  });

  it('non genera varianti per un indirizzo già semplice', () => {
    expect(buildFallbackQueries('Corfu Town, Grecia')).toEqual([]);
  });

  it('non include mai la query originale tra le varianti', () => {
    const original = 'Ολύμπου - Olympou, Kavos, 490 80, Grecia';
    expect(buildFallbackQueries(original)).not.toContain(original);
  });

  it('come ultima risorsa propone solo la località se via/struttura non mappata', () => {
    const variants = buildFallbackQueries(
      'Ολύμπου - Olympou, Kavos, 490 80, Grecia',
    );
    expect(variants).toContain('Kavos, Grecia');
  });

  it('non riduce a una sola parola (il paese) un indirizzo già minimale', () => {
    expect(buildFallbackQueries('Corfu Town, Grecia')).toEqual([]);
  });
});
