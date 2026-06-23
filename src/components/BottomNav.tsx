import { useApp } from '../context/AppContext';
import type { TabId } from '../types';

const TABS: Array<{ id: TabId; icon: string }> = [
  { id: 'search', icon: '🔍' },
  { id: 'map', icon: '🗺️' },
  { id: 'nearby', icon: '📍' },
  { id: 'compare', icon: '📊' },
];

/** Navigazione inferiore mobile-first con pulsanti grandi. */
export function BottomNav() {
  const { activeTab, setActiveTab, t } = useApp();
  return (
    <nav className="bottom-nav" aria-label="Navigazione principale">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="bottom-nav__label">{t.nav[tab.id]}</span>
          </button>
        );
      })}
    </nav>
  );
}
