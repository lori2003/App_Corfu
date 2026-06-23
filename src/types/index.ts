// Tipi condivisi dell'applicazione.

/** Coppia di coordinate geografiche (gradi decimali). */
export interface Coordinates {
  lat: number;
  lon: number;
}

/** Identificatore delle categorie di punti di interesse supportate. */
export type CategoryId =
  | 'beach'
  | 'restaurant'
  | 'bar'
  | 'supermarket'
  | 'pharmacy'
  | 'bus_stop'
  | 'transport'; // porti, aeroporti, stazioni

/** Definizione di una categoria con etichetta, icona ed emoji per i marker. */
export interface CategoryDef {
  id: CategoryId;
  labelIt: string;
  labelEn: string;
  emoji: string;
  color: string;
}

/** Punto di interesse restituito da Overpass o da una sorgente equivalente. */
export interface Poi {
  id: string;
  name: string;
  category: CategoryId;
  coordinates: Coordinates;
  /** Distanza in linea d'aria dall'alloggio, in metri. Calcolata lato client. */
  distanceMeters: number;
  /** Eventuali tag grezzi utili (telefono, cucina, ecc.). */
  tags?: Record<string, string>;
}

/** Risultato di una geocodifica (Nominatim). */
export interface GeocodeResult {
  displayName: string;
  coordinates: Coordinates;
  /** Tipo OSM (es. "hotel", "house") quando disponibile. */
  type?: string;
}

/** Esito del tentativo di analisi di un link di un annuncio. */
export interface LinkParseResult {
  /** true se siamo riusciti a estrarre coordinate utilizzabili. */
  coordinates: Coordinates | null;
  /** Nome o titolo eventualmente ricavato dal link. */
  name: string | null;
  /** Portale riconosciuto (booking, airbnb, google, generic...). */
  provider: string;
  /** Messaggio esplicativo da mostrare all'utente. */
  message: string;
  /** true se l'estrazione automatica non e' possibile e serve fallback manuale. */
  needsManualInput: boolean;
}

/** Risultato di un calcolo di percorso (routing). */
export interface RouteResult {
  /** Distanza stradale in metri. */
  distanceMeters: number;
  /** Durata stimata in secondi. */
  durationSeconds: number;
}

/** Tempi e distanze stimati verso una destinazione. */
export interface TravelEstimate {
  straightLineMeters: number;
  /** Distanza stradale, se ottenuta dal servizio di routing. */
  roadMeters?: number;
  /** Tempo a piedi stimato in secondi. */
  walkSeconds: number;
  /** Tempo in auto stimato in secondi. */
  driveSeconds: number;
}

/** Punto di riferimento fisso di Corfù (centro, aeroporto, spiagge...). */
export interface Landmark {
  id: string;
  nameIt: string;
  nameEn: string;
  category: 'center' | 'airport' | 'port' | 'beach' | 'resort';
  coordinates: Coordinates;
}

/** Alloggio salvato per il confronto. */
export interface SavedRental {
  id: string;
  /** Nome personalizzato scelto dall'utente. */
  name: string;
  coordinates: Coordinates;
  /** Indirizzo/descrizione individuata. */
  address: string;
  /** Zona (es. nome localita'). */
  area: string;
  /** Link originale dell'annuncio (validato). */
  sourceUrl: string;
  /** Note personali. */
  notes: string;
  /** Metriche calcolate al momento del salvataggio. */
  metrics: RentalMetrics;
  /** Timestamp di creazione. */
  createdAt: number;
}

/** Metriche sintetiche calcolate per un alloggio. */
export interface RentalMetrics {
  distanceToCenterMeters: number;
  nearestBeachMeters: number;
  distanceToAirportMeters: number;
  restaurantsWithin1km: number;
  supermarketsWithin1km: number;
}

/** Raggio di ricerca selezionabile, in metri. */
export type SearchRadius = 500 | 1000 | 3000 | 5000 | 10000;

/** Posizione dell'alloggio attualmente in esame (non ancora salvato). */
export interface ActiveLocation {
  coordinates: Coordinates;
  address: string;
  name: string;
  sourceUrl: string;
}

/** Sezioni dell'app raggiungibili dalla navigazione inferiore. */
export type TabId = 'search' | 'map' | 'nearby' | 'compare';
