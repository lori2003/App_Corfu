import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ActiveLocation, Coordinates, GeocodeResult, Poi, SavedRental } from '../types';
import { parseListingLink } from '../services/linkParser';
import { geocode, reverseGeocode } from '../services/geocoding';
import { fetchPois } from '../services/overpass';
import { describeError } from '../services/http';
import { computeMetrics } from '../lib/metrics';
import { isValidCoordinates } from '../lib/distance';
import { parseCoordinates, sanitizeText, sanitizeUrl } from '../lib/sanitize';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { MapView } from '../components/MapView';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { Disclaimer } from '../components/Disclaimer';

export function SearchPage() {
  const { t, activeLocation, setActiveLocation, addRental, setActiveTab } = useApp();

  const [linkInput, setLinkInput] = useState('');
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [coordsInput, setCoordsInput] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<Coordinates | null>(null);

  const debouncedAddress = useDebouncedValue(addressInput, 600);
  const lastQuery = useRef('');

  // Ricerca indirizzo con debounce.
  useEffect(() => {
    const q = sanitizeText(debouncedAddress, 200);
    if (q.length < 3) {
      setResults([]);
      setSearchError(null);
      return;
    }
    if (q === lastQuery.current) return;
    lastQuery.current = q;

    let cancelled = false;
    setSearching(true);
    setSearchError(null);
    geocode(q)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .catch((err) => {
        if (!cancelled) setSearchError(describeError(err));
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedAddress]);

  async function applyLocation(coords: Coordinates, name: string, sourceUrl: string) {
    let address = '';
    try {
      const rev = await reverseGeocode(coords);
      address = rev?.displayName ?? '';
    } catch {
      address = '';
    }
    const loc: ActiveLocation = {
      coordinates: coords,
      name: name || address.split(',')[0] || 'Alloggio',
      address,
      sourceUrl,
    };
    setActiveLocation(loc);
    setResults([]);
    setPickMode(false);
    setPickedPoint(null);
  }

  function handleAnalyzeLink() {
    const result = parseListingLink(linkInput);
    setLinkMessage(result.message);
    if (result.coordinates) {
      void applyLocation(
        result.coordinates,
        result.name ?? '',
        sanitizeUrl(linkInput) ?? '',
      );
    } else if (result.needsManualInput) {
      // Pre-compila il nome se ricavato dal link, per il salvataggio.
      if (result.name && !addressInput) setAddressInput(result.name);
    }
  }

  function handleUseCoords() {
    const c = parseCoordinates(coordsInput);
    if (!c) {
      setSearchError(t.search.noResults);
      return;
    }
    void applyLocation(c, '', sanitizeUrl(linkInput) ?? '');
  }

  function handleSelectResult(r: GeocodeResult) {
    void applyLocation(r.coordinates, r.displayName.split(',')[0], sanitizeUrl(linkInput) ?? '');
  }

  return (
    <div className="page">
      <h1 className="page__title">{t.search.title}</h1>

      {/* 1. Link annuncio */}
      <section className="card card--step">
        <label className="field-label" htmlFor="link-input">
          {t.search.linkLabel}
        </label>
        <input
          id="link-input"
          type="url"
          inputMode="url"
          className="text-input"
          placeholder={t.search.linkPlaceholder}
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
        />
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={handleAnalyzeLink}
          disabled={!linkInput.trim()}
        >
          {t.search.analyze}
        </button>
        {linkMessage && <p className="hint hint--info">{linkMessage}</p>}
      </section>

      <div className="divider">{t.search.orDivider}</div>

      {/* 2. Indirizzo / nome struttura */}
      <section className="card card--step">
        <label className="field-label" htmlFor="address-input">
          {t.search.addressLabel}
        </label>
        <input
          id="address-input"
          type="text"
          className="text-input"
          placeholder={t.search.addressPlaceholder}
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          autoComplete="off"
        />
        {searching && <Spinner label={t.common.loading} />}
        {searchError && <ErrorBanner message={searchError} retryLabel={t.common.retry} />}
        {results.length > 0 && (
          <ul className="result-list" aria-label={t.search.selectResult}>
            {results.map((r, i) => (
              <li key={`${r.coordinates.lat}-${r.coordinates.lon}-${i}`}>
                <button type="button" className="result-list__item" onClick={() => handleSelectResult(r)}>
                  <span className="result-list__name">{r.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!searching && !searchError && debouncedAddress.length >= 3 && results.length === 0 && (
          <p className="hint">{t.search.noResults}</p>
        )}
      </section>

      {/* 3. Coordinate */}
      <section className="card card--step">
        <label className="field-label" htmlFor="coords-input">
          {t.search.coordsLabel}
        </label>
        <div className="inline-field">
          <input
            id="coords-input"
            type="text"
            inputMode="decimal"
            className="text-input"
            placeholder={t.search.coordsPlaceholder}
            value={coordsInput}
            onChange={(e) => setCoordsInput(e.target.value)}
          />
          <button type="button" className="btn" onClick={handleUseCoords}>
            {t.search.useCoords}
          </button>
        </div>
      </section>

      {/* 4. Selezione su mappa */}
      <section className="card card--step">
        <button
          type="button"
          className="btn btn--block"
          onClick={() => {
            setPickMode((v) => !v);
            setPickedPoint(activeLocation?.coordinates ?? null);
          }}
          aria-expanded={pickMode}
        >
          📌 {t.search.pickOnMap}
        </button>
        {pickMode && (
          <div className="pick-map">
            <p className="hint">{t.search.pickHint}</p>
            <MapView
              rental={pickedPoint}
              onPick={(c) => setPickedPoint(c)}
              focus={pickedPoint}
            />
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!isValidCoordinates(pickedPoint)}
              onClick={() => pickedPoint && void applyLocation(pickedPoint, '', '')}
            >
              {t.search.confirmPosition}
            </button>
          </div>
        )}
      </section>

      {/* Riepilogo posizione attiva + salvataggio */}
      {activeLocation && (
        <ActiveLocationCard
          location={activeLocation}
          onClear={() => setActiveLocation(null)}
          onSaved={(rental) => {
            addRental(rental);
            setActiveTab('compare');
          }}
          onViewNearby={() => setActiveTab('nearby')}
        />
      )}

      <Disclaimer />
    </div>
  );
}

interface ActiveLocationCardProps {
  location: ActiveLocation;
  onClear: () => void;
  onSaved: (rental: SavedRental) => void;
  onViewNearby: () => void;
}

function ActiveLocationCard({ location, onClear, onSaved, onViewNearby }: ActiveLocationCardProps) {
  const { t } = useApp();
  const [name, setName] = useState(location.name);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Aggiorna il nome quando cambia la posizione attiva.
  useEffect(() => {
    setName(location.name);
  }, [location.name, location.coordinates.lat, location.coordinates.lon]);

  async function handleSave() {
    setSaving(true);
    let pois: Poi[] = [];
    try {
      pois = await fetchPois(['restaurant', 'supermarket'], location.coordinates, 1000);
    } catch {
      // In caso di errore salviamo comunque con conteggi a 0 (metriche parziali).
    }
    const metrics = computeMetrics(location.coordinates, pois);

    const rental: SavedRental = {
      id: `rental-${Date.now()}`,
      name: sanitizeText(name, 80) || 'Alloggio',
      coordinates: location.coordinates,
      address: location.address,
      area: location.address.split(',').slice(0, 2).join(',').trim(),
      sourceUrl: location.sourceUrl,
      notes: sanitizeText(notes, 500),
      metrics,
      createdAt: Date.now(),
    };
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    onSaved(rental);
  }

  return (
    <section className="card card--highlight">
      <h2 className="section-title">{t.search.detected}</h2>
      <p className="active-location__address">{location.address || '—'}</p>
      <p className="active-location__coords">
        {location.coordinates.lat.toFixed(5)}, {location.coordinates.lon.toFixed(5)}
      </p>

      <label className="field-label" htmlFor="rental-name">
        {t.search.nameLabel}
      </label>
      <input
        id="rental-name"
        type="text"
        className="text-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
      />

      <label className="field-label" htmlFor="rental-notes">
        {t.search.notesLabel}
      </label>
      <textarea
        id="rental-notes"
        className="text-input"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={500}
      />

      <div className="active-location__actions">
        <button type="button" className="btn" onClick={onViewNearby}>
          📍 {t.nav.nearby}
        </button>
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? t.common.loading : savedFlash ? t.search.saved : t.search.saveRental}
        </button>
      </div>
      <button type="button" className="link-btn link-btn--danger" onClick={onClear}>
        {t.search.clearRental}
      </button>
    </section>
  );
}
