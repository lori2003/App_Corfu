import { useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { SearchPage } from './pages/SearchPage';
import { MapPage } from './pages/MapPage';
import { NearbyPage } from './pages/NearbyPage';
import { ComparePage } from './pages/ComparePage';

export function App() {
  const { activeTab, language, setLanguage, t } = useApp();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__title">{t.appTitle}</span>
        <button
          type="button"
          className="lang-toggle"
          onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
          aria-label="Cambia lingua / Switch language"
        >
          {language === 'it' ? '🇬🇧 EN' : '🇮🇹 IT'}
        </button>
      </header>

      <main className="app-main">
        {activeTab === 'search' && <SearchPage />}
        {activeTab === 'map' && <MapPage />}
        {activeTab === 'nearby' && <NearbyPage />}
        {activeTab === 'compare' && <ComparePage />}
      </main>

      <BottomNav />
    </div>
  );
}
