import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNearbyPois } from '../hooks/useNearbyPois';
import { MapView } from '../components/MapView';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import { directionsTo } from '../lib/mapLinks';
import type { Coordinates } from '../types';

export function MapPage() {
  const { t, activeLocation, enabledCategories, radius, mapFocus, setActiveTab } = useApp();
  const [recenter, setRecenter] = useState<Coordinates | null>(null);

  const categories = useMemo(() => Array.from(enabledCategories), [enabledCategories]);
  const { pois, loading, error, retry } = useNearbyPois(
    activeLocation?.coordinates ?? null,
    radius,
    categories,
  );

  if (!activeLocation) {
    return (
      <div className="page">
        <EmptyState
          icon="🗺️"
          message={t.map.noRental}
          action={
            <button type="button" className="btn btn--primary" onClick={() => setActiveTab('search')}>
              {t.nav.search}
            </button>
          }
        />
      </div>
    );
  }

  const focus = recenter ?? mapFocus ?? null;

  return (
    <div className="page page--map">
      <div className="map-toolbar">
        <CategoryFilter />
      </div>

      <div className="map-wrapper">
        <MapView rental={activeLocation.coordinates} pois={pois} focus={focus} rentalLabel={activeLocation.name} />
        <button
          type="button"
          className="map-fab"
          onClick={() => setRecenter({ ...activeLocation.coordinates })}
          aria-label={t.map.recenter}
          title={t.map.recenter}
        >
          🏠
        </button>
      </div>

      <div className="map-status">
        {loading && <Spinner label={t.nearby.loading} />}
        {error && <ErrorBanner message={error} onRetry={retry} retryLabel={t.common.retry} />}
        <a
          className="btn btn--small btn--ghost"
          href={directionsTo(activeLocation.coordinates)}
          target="_blank"
          rel="noopener noreferrer"
        >
          ➡️ {t.map.openInMaps}
        </a>
      </div>
      <p className="attribution">{t.common.attribution}</p>
    </div>
  );
}
