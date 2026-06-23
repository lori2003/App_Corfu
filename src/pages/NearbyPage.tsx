import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNearbyPois } from '../hooks/useNearbyPois';
import { RadiusSelector } from '../components/RadiusSelector';
import { CategoryFilter } from '../components/CategoryFilter';
import { PlaceCard } from '../components/PlaceCard';
import { LandmarkList } from '../components/LandmarkList';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import { Disclaimer } from '../components/Disclaimer';

export function NearbyPage() {
  const { t, activeLocation, enabledCategories, radius, setActiveTab } = useApp();

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
          icon="📍"
          message={t.nearby.noRental}
          action={
            <button type="button" className="btn btn--primary" onClick={() => setActiveTab('search')}>
              {t.nav.search}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">{t.nearby.title}</h1>

      <div className="sticky-controls">
        <RadiusSelector />
        <CategoryFilter />
      </div>

      {loading && <Spinner label={t.nearby.loading} />}
      {error && <ErrorBanner message={error} onRetry={retry} retryLabel={t.common.retry} />}

      {!loading && !error && (
        <>
          {pois.length > 0 ? (
            <>
              <p className="result-count">
                {pois.length} {t.nearby.countLabel}
              </p>
              <div className="place-list">
                {pois.map((poi) => (
                  <PlaceCard key={poi.id} poi={poi} origin={activeLocation.coordinates} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="🔎" message={t.nearby.empty} />
          )}
        </>
      )}

      <LandmarkList origin={activeLocation.coordinates} />
      <Disclaimer />
    </div>
  );
}
