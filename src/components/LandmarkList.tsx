import type { Coordinates } from '../types';
import { CORFU_LANDMARKS } from '../config/landmarks';
import { haversineMeters, formatDistance } from '../lib/distance';
import { directionsTo } from '../lib/mapLinks';
import { useApp } from '../context/AppContext';

const ICONS: Record<string, string> = {
  center: '🏛️',
  airport: '✈️',
  port: '⚓',
  beach: '🏖️',
  resort: '📍',
};

interface LandmarkListProps {
  origin: Coordinates;
}

/** Elenco dei punti di riferimento di Corfù con distanza dall'alloggio. */
export function LandmarkList({ origin }: LandmarkListProps) {
  const { t, language, focusOnMap } = useApp();

  const items = CORFU_LANDMARKS.map((l) => ({
    ...l,
    distance: haversineMeters(origin, l.coordinates),
  })).sort((a, b) => a.distance - b.distance);

  return (
    <section className="landmark-list">
      <h2 className="section-title">{t.nearby.landmarks}</h2>
      <ul>
        {items.map((l) => (
          <li key={l.id} className="landmark-list__item">
            <span className="landmark-list__icon" aria-hidden="true">
              {ICONS[l.category] ?? '📍'}
            </span>
            <span className="landmark-list__name">
              {language === 'en' ? l.nameEn : l.nameIt}
            </span>
            <span className="landmark-list__distance">{formatDistance(l.distance)}</span>
            <button
              type="button"
              className="link-btn"
              aria-label={`${t.nearby.showOnMap}: ${l.nameIt}`}
              onClick={() => focusOnMap(l.coordinates)}
            >
              🗺️
            </button>
            <a
              className="link-btn"
              href={directionsTo(l.coordinates, origin)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.nearby.directions}: ${l.nameIt}`}
            >
              ➡️
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
