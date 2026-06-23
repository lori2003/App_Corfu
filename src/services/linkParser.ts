import type { Coordinates, LinkParseResult } from '../types';
import { sanitizeUrl, sanitizeText } from '../lib/sanitize';
import { isValidCoordinates } from '../lib/distance';

/**
 * Analizza il link di un annuncio per provare a ricavare coordinate e nome
 * SENZA scraping e SENZA chiamate cross-origin: lavora solo sui dati già
 * presenti nell'URL (parametri, frammenti di percorso).
 *
 * Limiti reali noti:
 * - Booking.com e Airbnb NON espongono le coordinate esatte nell'URL
 *   dell'annuncio e bloccano l'accesso cross-origin dal browser: per questi
 *   portali l'estrazione automatica non è possibile e si richiede input
 *   manuale.
 * - I link di Google Maps invece contengono spesso le coordinate e vengono
 *   interpretati correttamente.
 */

const COORD_PARAM_PAIRS: Array<[string, string]> = [
  ['lat', 'lon'],
  ['lat', 'lng'],
  ['latitude', 'longitude'],
  ['mlat', 'mlon'],
];

export function parseListingLink(rawUrl: string): LinkParseResult {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) {
    return {
      coordinates: null,
      name: null,
      provider: 'invalid',
      message:
        'Il link non sembra valido. Incolla un indirizzo web completo (https://…).',
      needsManualInput: true,
    };
  }

  const url = new URL(safe);
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const provider = detectProvider(host);

  // 1) Coordinate esplicite nei parametri della query (vari nomi comuni).
  const fromParams = extractFromParams(url);
  if (fromParams) {
    return {
      coordinates: fromParams,
      name: extractName(url),
      provider,
      message: 'Posizione individuata dai parametri del link. Verifica che sia corretta.',
      needsManualInput: false,
    };
  }

  // 2) Pattern tipici di Google Maps (@lat,lon oppure !3dlat!4dlon).
  if (provider === 'google') {
    const fromGoogle = extractFromGoogleMaps(safe);
    if (fromGoogle) {
      return {
        coordinates: fromGoogle,
        name: extractName(url),
        provider,
        message: 'Posizione individuata dal link di Google Maps. Verifica che sia corretta.',
        needsManualInput: false,
      };
    }
  }

  // 3) Portali che bloccano l'estrazione automatica.
  if (provider === 'booking' || provider === 'airbnb') {
    return {
      coordinates: null,
      name: extractName(url),
      provider,
      message:
        provider === 'booking'
          ? 'I link di Booking.com non contengono la posizione esatta e il sito blocca la lettura automatica. Inserisci indirizzo, nome struttura o coordinate, oppure scegli il punto sulla mappa.'
          : 'I link di Airbnb non contengono la posizione esatta e il sito blocca la lettura automatica. Inserisci indirizzo, nome struttura o coordinate, oppure scegli il punto sulla mappa.',
      needsManualInput: true,
    };
  }

  // 4) Fallback generico: nessuna coordinata trovata nel link.
  return {
    coordinates: null,
    name: extractName(url),
    provider,
    message:
      'Non è stato possibile ricavare la posizione dal link. Inserisci indirizzo, nome struttura o coordinate, oppure scegli il punto sulla mappa.',
    needsManualInput: true,
  };
}

function detectProvider(host: string): string {
  if (host.includes('booking.')) return 'booking';
  if (host.includes('airbnb.')) return 'airbnb';
  if (host.includes('google.') || host === 'maps.app.goo.gl' || host === 'goo.gl')
    return 'google';
  if (host.includes('openstreetmap.')) return 'osm';
  return 'generic';
}

function extractFromParams(url: URL): Coordinates | null {
  const params = url.searchParams;

  // Coppie di parametri lat/lon.
  for (const [latKey, lonKey] of COORD_PARAM_PAIRS) {
    const lat = Number(params.get(latKey));
    const lon = Number(params.get(lonKey));
    if (params.has(latKey) && params.has(lonKey) && isValidCoordinates({ lat, lon })) {
      return { lat, lon };
    }
  }

  // Parametri combinati tipo q=lat,lon oppure ll=lat,lon / center=lat,lon.
  for (const key of ['q', 'll', 'center', 'query', 'destination']) {
    const value = params.get(key);
    const parsed = value ? parseLatLonPair(value) : null;
    if (parsed) return parsed;
  }
  return null;
}

function extractFromGoogleMaps(href: string): Coordinates | null {
  // Pattern "@lat,lon,zoom"
  const at = href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) {
    const c = { lat: Number(at[1]), lon: Number(at[2]) };
    if (isValidCoordinates(c)) return c;
  }
  // Pattern "!3dLAT!4dLON"
  const bang = href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bang) {
    const c = { lat: Number(bang[1]), lon: Number(bang[2]) };
    if (isValidCoordinates(c)) return c;
  }
  return null;
}

function parseLatLonPair(value: string): Coordinates | null {
  const m = value.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (!m) return null;
  const c = { lat: Number(m[1]), lon: Number(m[2]) };
  return isValidCoordinates(c) ? c : null;
}

function extractName(url: URL): string | null {
  // Booking: /hotel/gr/<nome>.it.html  → ricava lo slug come nome indicativo.
  const segments = url.pathname.split('/').filter(Boolean);
  const slug = segments.reverse().find((s) => /[a-z]/i.test(s) && s.length > 3);
  if (!slug) return null;
  const cleaned = decodeURIComponent(slug)
    .replace(/\.(html?|php)$/i, '')
    .replace(/\.[a-z]{2}$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\d{4,}\b/g, '')
    .trim();
  const name = sanitizeText(cleaned, 80);
  return name.length >= 3 ? name : null;
}
