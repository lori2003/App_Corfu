import type { SavedRental } from '../types';
import { formatDistance } from '../lib/distance';
import { useApp } from '../context/AppContext';

interface CompareTableProps {
  rentals: SavedRental[];
  onRename: (rental: SavedRental) => void;
  onDelete: (id: string) => void;
  onSetActive: (rental: SavedRental) => void;
}

/**
 * Tabella di confronto degli alloggi salvati.
 * Su mobile diventa scorrevole orizzontalmente; ogni alloggio è una colonna
 * così da affiancare facilmente i valori.
 */
export function CompareTable({
  rentals,
  onRename,
  onDelete,
  onSetActive,
}: CompareTableProps) {
  const { t } = useApp();

  const rows: Array<{ label: string; render: (r: SavedRental) => React.ReactNode }> = [
    { label: t.compare.area, render: (r) => r.area || '—' },
    { label: t.compare.center, render: (r) => formatDistance(r.metrics.distanceToCenterMeters) },
    { label: t.compare.beach, render: (r) => formatDistance(r.metrics.nearestBeachMeters) },
    { label: t.compare.airport, render: (r) => formatDistance(r.metrics.distanceToAirportMeters) },
    { label: t.compare.restaurants, render: (r) => String(r.metrics.restaurantsWithin1km) },
    { label: t.compare.supermarkets, render: (r) => String(r.metrics.supermarketsWithin1km) },
    {
      label: t.compare.notes,
      render: (r) => (r.notes ? r.notes : '—'),
    },
    {
      label: t.compare.link,
      render: (r) =>
        r.sourceUrl ? (
          <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
            {t.compare.open}
          </a>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="compare-scroll">
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col" className="compare-table__corner">
              {t.compare.name}
            </th>
            {rentals.map((r) => (
              <th key={r.id} scope="col">
                <div className="compare-table__rental-name">{r.name}</div>
                <div className="compare-table__rental-actions">
                  <button type="button" className="link-btn" onClick={() => onSetActive(r)}>
                    📍 {t.compare.setActive}
                  </button>
                  <button type="button" className="link-btn" onClick={() => onRename(r)}>
                    ✏️ {t.compare.rename}
                  </button>
                  <button
                    type="button"
                    className="link-btn link-btn--danger"
                    onClick={() => onDelete(r.id)}
                  >
                    🗑️ {t.compare.delete}
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {rentals.map((r) => (
                <td key={r.id}>{row.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
