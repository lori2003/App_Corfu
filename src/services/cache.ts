/**
 * Cache locale semplice con scadenza (TTL), persistita in localStorage.
 * Riduce le chiamate ripetute verso Nominatim/Overpass e rispetta così
 * meglio i limiti d'uso dei servizi gratuiti.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const PREFIX = 'corfu-cache:';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24 ore

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  try {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota superata: ignoriamo, la cache è solo un'ottimizzazione.
  }
}

/**
 * Recupera dalla cache oppure esegue il fetcher e memorizza il risultato.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = getCached<T>(key);
  if (hit !== null) return hit;
  const value = await fetcher();
  setCached(key, value, ttlMs);
  return value;
}
