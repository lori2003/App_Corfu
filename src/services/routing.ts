import type { Coordinates, RouteResult } from '../types';
import { fetchJson } from './http';
import { cached } from './cache';

/**
 * Routing stradale tramite il server demo pubblico di OSRM.
 * Non richiede chiavi API. È un servizio "best effort": in caso di errore
 * l'app ricade sulle stime basate sulla distanza in linea d'aria.
 *
 * Nota: il server demo di OSRM è pensato per test/uso leggero; per un
 * utilizzo intensivo andrebbe sostituito con un'istanza dedicata. La
 * logica è isolata qui per poter cambiare provider facilmente.
 */

const OSRM_BASE = 'https://router.project-osrm.org';

interface OsrmResponse {
  code: string;
  routes?: Array<{ distance: number; duration: number }>;
}

/**
 * Calcola distanza e durata stradali tra due punti per un dato profilo.
 * Restituisce null se il servizio non è disponibile.
 */
export async function fetchRoute(
  from: Coordinates,
  to: Coordinates,
  profile: 'driving' | 'walking' = 'driving',
): Promise<RouteResult | null> {
  const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = `${OSRM_BASE}/route/v1/${profile}/${coords}?overview=false&alternatives=false&steps=false`;
  const key = `route:${profile}:${coords}`;

  try {
    return await cached(key, async () => {
      const data = await fetchJson<OsrmResponse>(url, {
        timeoutMs: 12000,
        retries: 1,
      });
      const route = data.routes?.[0];
      if (data.code !== 'Ok' || !route) return null;
      return {
        distanceMeters: route.distance,
        durationSeconds: route.duration,
      };
    });
  } catch {
    return null;
  }
}
