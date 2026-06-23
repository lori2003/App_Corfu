import type { Coordinates } from '../types';

/**
 * Rimuove spazi superflui e tronca testi liberi a una lunghezza massima.
 * Serve a normalizzare input come nomi, indirizzi e note.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/**
 * Valida e normalizza un URL. Accetta solo http(s) per evitare schemi
 * pericolosi (javascript:, data:, ecc.). Restituisce null se non valido.
 */
export function sanitizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    // Prova ad aggiungere lo schema mancante.
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  return url.toString();
}

/**
 * Esegue l'escape dei caratteri HTML speciali per prevenire l'iniezione
 * di markup quando il testo proviene da fonti esterne (es. nomi POI).
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Estrae coordinate da una stringa nei formati comuni:
 * "39.6, 19.9" oppure "39.6 19.9" oppure "lat=39.6,lon=19.9".
 * Restituisce null se non riconosciuto o fuori range.
 */
export function parseCoordinates(input: string): Coordinates | null {
  if (!input) return null;
  const matches = input.match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 2) return null;
  const lat = Number(matches[0]);
  const lon = Number(matches[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}
