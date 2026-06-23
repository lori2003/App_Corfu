import type { CategoryId, Coordinates, Poi } from '../types';
import { fetchJson } from './http';
import { cached } from './cache';
import { haversineMeters } from '../lib/distance';
import { sanitizeText } from '../lib/sanitize';

/**
 * Ricerca di punti di interesse tramite Overpass API (dati OpenStreetMap).
 * Nessuna chiave richiesta. I risultati sono messi in cache per ridurre il
 * carico sui server pubblici e rispettarne i limiti d'uso.
 */

// Endpoint pubblici di Overpass; in caso di errore si prova il successivo.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

/**
 * Filtri Overpass per categoria. Ogni voce è un frammento QL che seleziona
 * nodi/way/relazioni con i tag pertinenti.
 */
const CATEGORY_FILTERS: Record<CategoryId, string[]> = {
  beach: ['natural=beach', 'leisure=beach_resort'],
  restaurant: ['amenity=restaurant', 'amenity=fast_food'],
  bar: ['amenity=bar', 'amenity=pub', 'amenity=cafe'],
  supermarket: ['shop=supermarket', 'shop=convenience'],
  pharmacy: ['amenity=pharmacy'],
  bus_stop: ['highway=bus_stop', 'public_transport=platform'],
  transport: ['aeroway=aerodrome', 'amenity=ferry_terminal', 'harbour=yes'],
};

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(
  categories: CategoryId[],
  center: Coordinates,
  radiusMeters: number,
): string {
  const parts: string[] = [];
  for (const cat of categories) {
    for (const filter of CATEGORY_FILTERS[cat]) {
      const [key, value] = filter.split('=');
      const sel = `["${key}"="${value}"]`;
      parts.push(`node${sel}(around:${radiusMeters},${center.lat},${center.lon});`);
      parts.push(`way${sel}(around:${radiusMeters},${center.lat},${center.lon});`);
    }
  }
  return `[out:json][timeout:25];(${parts.join('')});out center tags;`;
}

/**
 * Recupera i POI delle categorie indicate entro un raggio dall'alloggio.
 * Restituisce i risultati ordinati per distanza crescente.
 */
export async function fetchPois(
  categories: CategoryId[],
  center: Coordinates,
  radiusMeters: number,
): Promise<Poi[]> {
  if (categories.length === 0) return [];

  const query = buildQuery(categories, center, radiusMeters);
  const cacheKey = `pois:${center.lat.toFixed(4)},${center.lon.toFixed(4)}:${radiusMeters}:${[...categories].sort().join(',')}`;

  return cached(
    cacheKey,
    async () => {
      const response = await queryWithFallback(query);
      const pois = response.elements
        .map((el) => mapElement(el, center))
        .filter((p): p is Poi => p !== null);

      // Deduplica per coordinate+nome e ordina per distanza.
      const seen = new Set<string>();
      const unique: Poi[] = [];
      for (const p of pois.sort((a, b) => a.distanceMeters - b.distanceMeters)) {
        const k = `${p.name}@${p.coordinates.lat.toFixed(5)},${p.coordinates.lon.toFixed(5)}`;
        if (seen.has(k)) continue;
        seen.add(k);
        unique.push(p);
      }
      return unique;
    },
    1000 * 60 * 60 * 6, // cache 6 ore
  );
}

async function queryWithFallback(query: string): Promise<OverpassResponse> {
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await fetchJson<OverpassResponse>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        timeoutMs: 25000,
        retries: 1,
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function categoryOf(tags: Record<string, string>): CategoryId | null {
  for (const [cat, filters] of Object.entries(CATEGORY_FILTERS) as [
    CategoryId,
    string[],
  ][]) {
    for (const f of filters) {
      const [k, v] = f.split('=');
      if (tags[k] === v) return cat;
    }
  }
  return null;
}

function mapElement(el: OverpassElement, center: Coordinates): Poi | null {
  const coords = el.lat != null && el.lon != null ? { lat: el.lat, lon: el.lon } : el.center;
  if (!coords) return null;
  const tags = el.tags ?? {};
  const category = categoryOf(tags);
  if (!category) return null;

  const name =
    sanitizeText(tags.name ?? tags['name:en'] ?? tags.brand ?? '', 120) ||
    defaultName(category);

  return {
    id: `${el.type}/${el.id}`,
    name,
    category,
    coordinates: { lat: coords.lat, lon: coords.lon },
    distanceMeters: haversineMeters(center, { lat: coords.lat, lon: coords.lon }),
    tags,
  };
}

function defaultName(category: CategoryId): string {
  const labels: Record<CategoryId, string> = {
    beach: 'Spiaggia',
    restaurant: 'Ristorante',
    bar: 'Bar',
    supermarket: 'Supermercato',
    pharmacy: 'Farmacia',
    bus_stop: 'Fermata bus',
    transport: 'Trasporti',
  };
  return labels[category];
}
