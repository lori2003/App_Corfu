import { useCallback, useEffect, useState } from 'react';
import type { CategoryId, Coordinates, Poi } from '../types';
import { fetchPois } from '../services/overpass';
import { describeError } from '../services/http';

interface State {
  pois: Poi[];
  loading: boolean;
  error: string | null;
}

/**
 * Scarica i POI delle categorie indicate attorno a una posizione.
 * Gestisce caricamento, errori e annullamento se le dipendenze cambiano.
 * Espone una funzione `retry` per riprovare dopo un errore.
 */
export function useNearbyPois(
  location: Coordinates | null,
  radiusMeters: number,
  categories: CategoryId[],
): State & { retry: () => void } {
  const [state, setState] = useState<State>({
    pois: [],
    loading: false,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  // Chiave stabile per evitare richieste duplicate quando l'array non cambia.
  const catKey = [...categories].sort().join(',');

  useEffect(() => {
    if (!location || categories.length === 0) {
      setState({ pois: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchPois(categories, location, radiusMeters)
      .then((pois) => {
        if (!cancelled) setState({ pois, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ pois: [], loading: false, error: describeError(err) });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lon, radiusMeters, catKey, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { ...state, retry };
}
