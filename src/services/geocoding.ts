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
 *
 * Gli indirizzi copiati da annunci (Booking/Airbnb) contengono spesso due
 * varianti dello stesso nome separate da " - " (greco e traslitterato) e
 * codici postali con spazio interno: Nominatim non trova nulla con la
 * stringa completa in questi casi, quindi se la prima ricerca non dà
 * risultati si ritenta con versioni progressivamente semplificate.
 */
export async function geocode(query: string): Promise<GeocodeResult[]> {
  const q = sanitizeText(query, 200);
  if (q.length < 3) return [];

  const results = await geocodeOnce(q);
  if (results.length > 0) return results;

  for (const variant of buildFallbackQueries(q)) {
    // Rispetta il limite di 1 richiesta/secondo della usage policy di Nominatim.
    await delay(1100);
    const fallbackResults = await geocodeOnce(variant);
    if (fallbackResults.length > 0) return fallbackResults;
  }
  return [];
}

async function geocodeOnce(q: string): Promise<GeocodeResult[]> {
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const POSTCODE_SEGMENT = /^[\d\s]{4,8}$/;

/**
 * Genera varianti semplificate della query, dalla più alla meno specifica:
 * rimuove il segmento del codice postale e, se il primo segmento contiene
 * due varianti del nome separate da " - ", le prova singolarmente.
 */
export function buildFallbackQueries(original: string): string[] {
  const segments = original
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return [];

  const withoutPostcode = segments.filter((s) => !POSTCODE_SEGMENT.test(s));
  const variants = new Set<string>();

  if (withoutPostcode.length !== segments.length && withoutPostcode.length > 0) {
    variants.add(withoutPostcode.join(', '));
  }

  const baseSegments = withoutPostcode.length > 0 ? withoutPostcode : segments;
  const dashMatch = baseSegments[0]?.match(/^(.+?)\s+-\s+(.+)$/);
  if (dashMatch) {
    const [, nameA, nameB] = dashMatch;
    for (const name of [nameB, nameA]) {
      variants.add([name, ...baseSegments.slice(1)].join(', '));
    }
  }

  variants.delete(original);
  return Array.from(variants).filter((v) => v.length >= 3);
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
