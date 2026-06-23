import { describe, it, expect } from 'vitest';
import { computeMetrics } from './metrics';
import type { Poi } from '../types';
import { CORFU_CENTER } from '../config/landmarks';

function poi(category: Poi['category'], distanceMeters: number): Poi {
  return {
    id: `${category}-${distanceMeters}`,
    name: category,
    category,
    coordinates: { lat: 39.6, lon: 19.9 },
    distanceMeters,
  };
}

describe('computeMetrics', () => {
  it('conta solo i POI entro 1 km per categoria', () => {
    const pois: Poi[] = [
      poi('restaurant', 200),
      poi('restaurant', 800),
      poi('restaurant', 1500), // oltre 1 km, escluso
      poi('supermarket', 300),
      poi('bar', 100), // categoria non conteggiata
    ];
    const m = computeMetrics({ lat: 39.6, lon: 19.9 }, pois);
    expect(m.restaurantsWithin1km).toBe(2);
    expect(m.supermarketsWithin1km).toBe(1);
  });

  it('calcola distanza dal centro pari a ~0 se sull’alloggio coincide col centro', () => {
    const m = computeMetrics(CORFU_CENTER.coordinates, []);
    expect(m.distanceToCenterMeters).toBeLessThan(5);
  });

  it('gestisce una lista di POI vuota', () => {
    const m = computeMetrics({ lat: 39.6, lon: 19.9 }, []);
    expect(m.restaurantsWithin1km).toBe(0);
    expect(m.supermarketsWithin1km).toBe(0);
    expect(m.nearestBeachMeters).toBeGreaterThan(0);
    expect(m.distanceToAirportMeters).toBeGreaterThan(0);
  });
});
