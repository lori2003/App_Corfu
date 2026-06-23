import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadRentals,
  saveRentals,
  upsertRental,
  removeRental,
  renameRental,
} from './storage';
import type { SavedRental } from '../types';

function makeRental(id: string, name = 'Casa'): SavedRental {
  return {
    id,
    name,
    coordinates: { lat: 39.6, lon: 19.9 },
    address: 'Corfù',
    area: 'Corfù',
    sourceUrl: 'https://example.com',
    notes: '',
    metrics: {
      distanceToCenterMeters: 1000,
      nearestBeachMeters: 500,
      distanceToAirportMeters: 3000,
      restaurantsWithin1km: 5,
      supermarketsWithin1km: 2,
    },
    createdAt: Date.now(),
  };
}

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('restituisce array vuoto quando non c’è nulla', () => {
    expect(loadRentals()).toEqual([]);
  });

  it('salva e ricarica gli alloggi (persistenza)', () => {
    const r = makeRental('a');
    saveRentals([r]);
    const loaded = loadRentals();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('a');
  });

  it('ignora dati corrotti o non validi', () => {
    localStorage.setItem('corfu-rentals:v1', '{not json');
    expect(loadRentals()).toEqual([]);

    localStorage.setItem(
      'corfu-rentals:v1',
      JSON.stringify([{ id: 'x' }, makeRental('valid')]),
    );
    const loaded = loadRentals();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('valid');
  });

  it('upsert aggiunge e poi aggiorna', () => {
    let list = upsertRental([], makeRental('a', 'Prima'));
    expect(list).toHaveLength(1);
    list = upsertRental(list, makeRental('a', 'Seconda'));
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Seconda');
  });

  it('rimuove e rinomina', () => {
    let list = [makeRental('a'), makeRental('b')];
    saveRentals(list);
    list = renameRental(list, 'a', 'Nuovo nome');
    expect(list.find((r) => r.id === 'a')?.name).toBe('Nuovo nome');
    list = removeRental(list, 'b');
    expect(list).toHaveLength(1);
    expect(loadRentals()).toHaveLength(1);
  });
});
