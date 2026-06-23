import type { Coordinates, TravelEstimate } from '../types';

const EARTH_RADIUS_M = 6371000;

/** Velocità medie usate per stimare i tempi quando non c'è routing reale. */
export const WALKING_SPEED_MPS = 1.35; // ~4.85 km/h
export const DRIVING_SPEED_MPS = 11.1; // ~40 km/h (strade locali/turistiche)

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Distanza in linea d'aria (formula dell'emisenoverso / haversine) in metri.
 */
export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

/**
 * Stima tempi a piedi e in auto a partire dalla distanza.
 * Se è disponibile una distanza stradale (roadMeters) la usa, altrimenti
 * applica un fattore di tortuosità del 30% alla distanza in linea d'aria.
 */
export function estimateTravel(
  straightLineMeters: number,
  roadMeters?: number,
): TravelEstimate {
  const effective = roadMeters ?? straightLineMeters * 1.3;
  return {
    straightLineMeters,
    roadMeters,
    walkSeconds: effective / WALKING_SPEED_MPS,
    driveSeconds: effective / DRIVING_SPEED_MPS,
  };
}

/** Formatta una distanza in metri in una stringa leggibile (m / km). */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

/** Formatta una durata in secondi in una stringa leggibile (min / h). */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return '< 1 min';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Verifica se una coppia di coordinate è plausibile. */
export function isValidCoordinates(c: Coordinates | null | undefined): c is Coordinates {
  return (
    !!c &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lon) &&
    c.lat >= -90 &&
    c.lat <= 90 &&
    c.lon >= -180 &&
    c.lon <= 180
  );
}
