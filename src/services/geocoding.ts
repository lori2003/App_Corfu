import type { Coordinates, GeocodeResult } from '../types';
import { fetchJson } from './http';
import { cached } from './cache';
import { sanitizeText } from '../lib/sanitize';

/**
 * Geocodifica tramite Nominatim (OpenStreetMap).
 *
 * Rispetto della usage policy di Nominatim:
 * - massimo 1 richiesta al secondo (l'app usa debounce + cache);
 * - viene inviato un parametro identificativo dell'app;
 * - i risultati vengono messi in cache per evitare richieste ripetute.
 * Vedi: https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Riquadro approssimativo dell'isola di Corfù per dare priorità ai risultati locali.
// (left, top, right, bottom) = (lon_min, lat_max, lon_max, lat_min)
const CORFU_VIEWBOX = '19.6,39.85,20.2,39.35';

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
}

/**
 * Cerca un indirizzo o il nome di una struttura e restituisce i risultati,
 * dando priorità all'area di Corfù.
 */
export async function geocode(query: string): Promise<GeocodeResult[]> {
  const q = sanitizeText(query, 200);
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    limit: '6',
    addressdetails: '0',
    viewbox: CORFU_VIEWBOX,
    bounded: '0',
  });
  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;

  return cached(`geocode:${q.toLowerCase()}`, async () => {
    const items = await fetchJson<NominatimItem[]>(url, {
      headers: { Accept: 'application/json' },
      timeoutMs: 12000,
    });
    return items
      .map(mapItem)
      .filter((r): r is GeocodeResult => r !== null);
  });
}

/** Reverse geocoding: da coordinate a indirizzo leggibile. */
export async function reverseGeocode(
  coords: Coordinates,
): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lon),
    format: 'jsonv2',
    zoom: '16',
  });
  const url = `${NOMINATIM_BASE}/reverse?${params.toString()}`;
  const key = `reverse:${coords.lat.toFixed(5)},${coords.lon.toFixed(5)}`;

  return cached(key, async () => {
    try {
      const item = await fetchJson<NominatimItem>(url, {
        headers: { Accept: 'application/json' },
        timeoutMs: 12000,
      });
      return mapItem(item);
    } catch {
      return null;
    }
  });
}

function mapItem(item: NominatimItem): GeocodeResult | null {
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    displayName: item.display_name,
    coordinates: { lat, lon },
    type: item.type,
  };
}
