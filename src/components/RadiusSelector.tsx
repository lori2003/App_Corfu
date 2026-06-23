import { useApp } from '../context/AppContext';
import type { SearchRadius } from '../types';

const RADII: SearchRadius[] = [500, 1000, 3000, 5000, 10000];

function label(r: SearchRadius): string {
  return r < 1000 ? `${r} m` : `${r / 1000} km`;
}

/** Selettore del raggio di ricerca dei POI. */
export function RadiusSelector() {
  const { radius, setRadius, t } = useApp();
  return (
    <div className="radius-selector">
      <span className="radius-selector__label">{t.nearby.radius}:</span>
      <div className="radius-selector__options" role="group" aria-label={t.nearby.radius}>
        {RADII.map((r) => (
          <button
            key={r}
            type="button"
            className={`chip${radius === r ? ' chip--active' : ''}`}
            aria-pressed={radius === r}
            onClick={() => setRadius(r)}
          >
            {label(r)}
          </button>
        ))}
      </div>
    </div>
  );
}
