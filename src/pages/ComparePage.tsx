import { useApp } from '../context/AppContext';
import { CompareTable } from '../components/CompareTable';
import { EmptyState } from '../components/EmptyState';
import { Disclaimer } from '../components/Disclaimer';
import type { SavedRental } from '../types';

export function ComparePage() {
  const { t, savedRentals, deleteRental, renameRental, setActiveLocation, setActiveTab } = useApp();

  function handleRename(rental: SavedRental) {
    const name = window.prompt(t.compare.rename, rental.name);
    if (name && name.trim()) renameRental(rental.id, name.trim().slice(0, 80));
  }

  function handleDelete(id: string) {
    if (window.confirm(t.compare.confirmDelete)) deleteRental(id);
  }

  function handleSetActive(rental: SavedRental) {
    setActiveLocation({
      coordinates: rental.coordinates,
      name: rental.name,
      address: rental.address,
      sourceUrl: rental.sourceUrl,
    });
    setActiveTab('map');
  }

  return (
    <div className="page">
      <h1 className="page__title">{t.compare.title}</h1>
      {savedRentals.length === 0 ? (
        <EmptyState
          icon="📊"
          message={t.compare.empty}
          action={
            <button type="button" className="btn btn--primary" onClick={() => setActiveTab('search')}>
              {t.nav.search}
            </button>
          }
        />
      ) : (
        <>
          <CompareTable
            rentals={savedRentals}
            onRename={handleRename}
            onDelete={handleDelete}
            onSetActive={handleSetActive}
          />
          <Disclaimer />
        </>
      )}
    </div>
  );
}
