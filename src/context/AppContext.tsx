import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActiveLocation,
  CategoryId,
  Coordinates,
  SavedRental,
  SearchRadius,
  TabId,
} from '../types';
import { CATEGORIES } from '../config/categories';
import {
  loadRentals,
  removeRental as removeRentalStorage,
  renameRental as renameRentalStorage,
  upsertRental,
} from '../lib/storage';
import {
  DEFAULT_LANGUAGE,
  translations,
  type Language,
  type Translations,
} from '../i18n';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;

  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  activeLocation: ActiveLocation | null;
  setActiveLocation: (loc: ActiveLocation | null) => void;

  radius: SearchRadius;
  setRadius: (r: SearchRadius) => void;

  enabledCategories: Set<CategoryId>;
  toggleCategory: (id: CategoryId) => void;

  savedRentals: SavedRental[];
  addRental: (rental: SavedRental) => void;
  deleteRental: (id: string) => void;
  renameRental: (id: string, name: string) => void;

  /** Coordinata su cui centrare la mappa (es. dopo "mostra sulla mappa"). */
  mapFocus: Coordinates | null;
  focusOnMap: (coords: Coordinates) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [activeTab, setActiveTab] = useState<TabId>('search');
  const [activeLocation, setActiveLocation] = useState<ActiveLocation | null>(null);
  const [radius, setRadius] = useState<SearchRadius>(1000);
  const [enabledCategories, setEnabledCategories] = useState<Set<CategoryId>>(
    () => new Set(CATEGORIES.map((c) => c.id)),
  );
  const [savedRentals, setSavedRentals] = useState<SavedRental[]>(() => loadRentals());
  const [mapFocus, setMapFocus] = useState<Coordinates | null>(null);

  // Mantiene la lista in sync se più tab/finestre modificano lo storage.
  useEffect(() => {
    const onStorage = () => setSavedRentals(loadRentals());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleCategory = useCallback((id: CategoryId) => {
    setEnabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addRental = useCallback((rental: SavedRental) => {
    setSavedRentals((prev) => upsertRental(prev, rental));
  }, []);

  const deleteRental = useCallback((id: string) => {
    setSavedRentals((prev) => removeRentalStorage(prev, id));
  }, []);

  const renameRental = useCallback((id: string, name: string) => {
    setSavedRentals((prev) => renameRentalStorage(prev, id, name));
  }, []);

  const focusOnMap = useCallback((coords: Coordinates) => {
    setMapFocus(coords);
    setActiveTab('map');
  }, []);

  const value = useMemo<AppState>(
    () => ({
      language,
      setLanguage,
      t: translations[language],
      activeTab,
      setActiveTab,
      activeLocation,
      setActiveLocation,
      radius,
      setRadius,
      enabledCategories,
      toggleCategory,
      savedRentals,
      addRental,
      deleteRental,
      renameRental,
      mapFocus,
      focusOnMap,
    }),
    [
      language,
      activeTab,
      activeLocation,
      radius,
      enabledCategories,
      savedRentals,
      mapFocus,
      toggleCategory,
      addRental,
      deleteRental,
      renameRental,
      focusOnMap,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve essere usato dentro <AppProvider>');
  return ctx;
}
