import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../config/categories';

/** Chip per mostrare/nascondere le categorie di POI. */
export function CategoryFilter() {
  const { enabledCategories, toggleCategory, language } = useApp();
  return (
    <div className="category-filter" role="group" aria-label="Filtri categorie">
      {CATEGORIES.map((cat) => {
        const active = enabledCategories.has(cat.id);
        const label = language === 'en' ? cat.labelEn : cat.labelIt;
        return (
          <button
            key={cat.id}
            type="button"
            className={`chip${active ? ' chip--active' : ''}`}
            style={active ? { borderColor: cat.color, background: `${cat.color}1a` } : undefined}
            aria-pressed={active}
            onClick={() => toggleCategory(cat.id)}
          >
            <span aria-hidden="true">{cat.emoji}</span> {label}
          </button>
        );
      })}
    </div>
  );
}
