import { describe, it, expect } from 'vitest';
import {
  haversineMeters,
  estimateTravel,
  formatDistance,
  formatDuration,
  isValidCoordinates,
} from './distance';

describe('haversineMeters', () => {
  it('restituisce 0 per lo stesso punto', () => {
    const p = { lat: 39.6243, lon: 19.9217 };
    expect(haversineMeters(p, p)).toBe(0);
  });

  it('calcola una distanza nota con tolleranza', () => {
    // Centro di Corfù → Aeroporto ≈ 2.5 km in linea d'aria.
    const center = { lat: 39.6243, lon: 19.9217 };
    const airport = { lat: 39.6019, lon: 19.9117 };
    const d = haversineMeters(center, airport);
    expect(d).toBeGreaterThan(2000);
    expect(d).toBeLessThan(3200);
  });

  it('è simmetrica', () => {
    const a = { lat: 39.6, lon: 19.9 };
    const b = { lat: 39.7, lon: 19.8 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 5);
  });
});

describe('estimateTravel', () => {
  it('usa la distanza stradale quando disponibile', () => {
    const e = estimateTravel(1000, 1500);
    expect(e.roadMeters).toBe(1500);
    // Tempo a piedi ≈ 1500 / 1.35 ≈ 1111 s.
    expect(e.walkSeconds).toBeGreaterThan(1000);
  });

  it('applica un fattore di tortuosità senza distanza stradale', () => {
    const e = estimateTravel(1000);
    expect(e.roadMeters).toBeUndefined();
    // 1000 * 1.3 / 1.35 ≈ 963 s.
    expect(e.walkSeconds).toBeCloseTo(963, 0);
  });
});

describe('formatDistance', () => {
  it('formatta metri e chilometri', () => {
    expect(formatDistance(450)).toBe('450 m');
    expect(formatDistance(1500)).toBe('1.5 km');
    expect(formatDistance(12000)).toBe('12 km');
  });

  it('gestisce valori non validi', () => {
    expect(formatDistance(-1)).toBe('—');
    expect(formatDistance(NaN)).toBe('—');
  });
});

describe('formatDuration', () => {
  it('formatta minuti e ore', () => {
    expect(formatDuration(30)).toBe('< 1 min');
    expect(formatDuration(600)).toBe('10 min');
    expect(formatDuration(3660)).toBe('1 h 1 min');
    expect(formatDuration(7200)).toBe('2 h');
  });
});

describe('isValidCoordinates', () => {
  it('accetta coordinate valide', () => {
    expect(isValidCoordinates({ lat: 39.6, lon: 19.9 })).toBe(true);
  });

  it('rifiuta coordinate fuori range o assenti', () => {
    expect(isValidCoordinates({ lat: 200, lon: 19.9 })).toBe(false);
    expect(isValidCoordinates(null)).toBe(false);
    expect(isValidCoordinates(undefined)).toBe(false);
    expect(isValidCoordinates({ lat: NaN, lon: 0 })).toBe(false);
  });
});
