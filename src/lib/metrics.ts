import type { Coordinates, Poi, RentalMetrics } from '../types';
import { CORFU_AIRPORT, CORFU_CENTER, CORFU_LANDMARKS } from '../config/landmarks';
import { haversineMeters } from './distance';

/**
 * Calcola le metriche sintetiche di un alloggio usate nel confronto.
 * Le distanze verso centro/aeroporto/spiagge si basano sui landmark fissi;
 * i conteggi di ristoranti/supermercati usano i POI già scaricati (entro 1 km).
 */
export function computeMetrics(
  coordinates: Coordinates,
  pois: Poi[],
): RentalMetrics {
  const beaches = CORFU_LANDMARKS.filter((l) => l.category === 'beach');
  const nearestBeach = beaches.reduce((min, b) => {
    const d = haversineMeters(coordinates, b.coordinates);
    return d < min ? d : min;
  }, Number.POSITIVE_INFINITY);

  const within1km = (cat: Poi['category']) =>
    pois.filter((p) => p.category === cat && p.distanceMeters <= 1000).length;

  return {
    distanceToCenterMeters: haversineMeters(coordinates, CORFU_CENTER.coordinates),
    nearestBeachMeters: Number.isFinite(nearestBeach) ? nearestBeach : 0,
    distanceToAirportMeters: haversineMeters(coordinates, CORFU_AIRPORT.coordinates),
    restaurantsWithin1km: within1km('restaurant'),
    supermarketsWithin1km: within1km('supermarket'),
  };
}
