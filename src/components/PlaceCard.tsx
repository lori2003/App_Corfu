import { useState } from 'react';
import type { Coordinates, Poi } from '../types';
import { CATEGORY_MAP } from '../config/categories';
import {
  estimateTravel,
  formatDistance,
  formatDuration,
} from '../lib/distance';
import { fetchRoute } from '../services/routing';
import { directionsTo } from '../lib/mapLinks';
import { useApp } from '../context/AppContext';

interface PlaceCardProps {
  poi: Poi;
  origin: Coordinates;
}

/** Scheda di un punto di interesse con distanze, tempi e azioni. */
export function PlaceCard({ poi, origin }: PlaceCardProps) {
  const { t, focusOnMap, language } = useApp();
  const [roadMeters, setRoadMeters] = useState<number | undefined>();
  const [loadingRoute, setLoadingRoute] = useState(false);

  const def = CATEGORY_MAP[poi.category];
  const estimate = estimateTravel(poi.distanceMeters, roadMeters);
  const label = language === 'en' ? def.labelEn : def.labelIt;

  async function loadRoute() {
    setLoadingRoute(true);
    const route = await fetchRoute(origin, poi.coordinates, 'driving');
    if (route) setRoadMeters(route.distanceMeters);
    setLoadingRoute(false);
  }

  return (
    <article className="place-card">
      <div className="place-card__header">
        <span className="place-card__emoji" aria-hidden="true">
          {def.emoji}
        </span>
        <div className="place-card__title">
          <h3>{poi.name}</h3>
          <span className="place-card__category">{label}</span>
        </div>
        <span className="place-card__distance">{formatDistance(poi.distanceMeters)}</span>
      </div>

      <dl className="place-card__metrics">
        <div>
          <dt>{t.nearby.onFoot}</dt>
          <dd>{formatDuration(estimate.walkSeconds)}</dd>
        </div>
        <div>
          <dt>{t.nearby.byCar}</dt>
          <dd>{formatDuration(estimate.driveSeconds)}</dd>
        </div>
        <div>
          <dt>{t.nearby.byRoad}</dt>
          <dd>
            {roadMeters != null ? (
              formatDistance(roadMeters)
            ) : (
              <button
                type="button"
                className="link-btn"
                onClick={loadRoute}
                disabled={loadingRoute}
              >
                {loadingRoute ? '…' : `▸ ${t.nearby.calcRoute}`}
              </button>
            )}
          </dd>
        </div>
      </dl>

      <div className="place-card__actions">
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={() => focusOnMap(poi.coordinates)}
        >
          🗺️ {t.nearby.showOnMap}
        </button>
        <a
          className="btn btn--small btn--ghost"
          href={directionsTo(poi.coordinates, origin)}
          target="_blank"
          rel="noopener noreferrer"
        >
          ➡️ {t.nearby.directions}
        </a>
      </div>
    </article>
  );
}
