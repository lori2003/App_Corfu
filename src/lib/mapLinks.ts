import type { Coordinates } from '../types';

/**
 * Genera i link verso app di mappe esterne per aprire un itinerario.
 * Non espone alcuna chiave: usa gli URL pubblici universali.
 */

/** Itinerario su Google Maps da un punto a una destinazione. */
export function googleMapsDirections(
  from: Coordinates,
  to: Coordinates,
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lon}&destination=${to.lat},${to.lon}`;
}

/** Itinerario su Apple Maps (saddr/daddr). */
export function appleMapsDirections(
  from: Coordinates,
  to: Coordinates,
): string {
  return `https://maps.apple.com/?saddr=${from.lat},${from.lon}&daddr=${to.lat},${to.lon}`;
}

/** Scheda di un singolo punto su Google Maps. */
export function googleMapsPlace(coords: Coordinates, label?: string): string {
  const q = label
    ? `${encodeURIComponent(label)}@${coords.lat},${coords.lon}`
    : `${coords.lat},${coords.lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}&query_place_id=${encodeURIComponent(q)}`;
}

/** Rileva in modo grossolano i dispositivi Apple per preferire Apple Maps. */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
}

/** Itinerario verso una destinazione usando l'app preferita dal dispositivo. */
export function directionsTo(to: Coordinates, from?: Coordinates | null): string {
  const origin = from ?? { lat: NaN, lon: NaN };
  const hasOrigin = Number.isFinite(origin.lat) && Number.isFinite(origin.lon);
  if (isAppleDevice()) {
    return hasOrigin
      ? appleMapsDirections(origin, to)
      : `https://maps.apple.com/?daddr=${to.lat},${to.lon}`;
  }
  return hasOrigin
    ? googleMapsDirections(origin, to)
    : `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lon}`;
}
