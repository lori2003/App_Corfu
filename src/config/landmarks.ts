import type { Landmark } from '../types';

/**
 * Punti di riferimento fissi dell'isola di Corfù (Kerkyra).
 * Le coordinate sono indicative e basate su dati pubblici di OpenStreetMap.
 * Aggiungere o modificare voci qui per estendere la lista; nessun'altra
 * parte dell'app va toccata.
 */
export const CORFU_LANDMARKS: Landmark[] = [
  {
    id: 'corfu-old-town',
    nameIt: 'Centro storico di Corfù',
    nameEn: 'Corfu Old Town',
    category: 'center',
    coordinates: { lat: 39.6243, lon: 19.9217 },
  },
  {
    id: 'corfu-airport',
    nameIt: 'Aeroporto di Corfù (CFU)',
    nameEn: 'Corfu Airport (CFU)',
    category: 'airport',
    coordinates: { lat: 39.6019, lon: 19.9117 },
  },
  {
    id: 'corfu-port',
    nameIt: 'Nuovo porto di Corfù',
    nameEn: 'Corfu New Port',
    category: 'port',
    coordinates: { lat: 39.6289, lon: 19.9147 },
  },
  {
    id: 'paleokastritsa',
    nameIt: 'Paleokastritsa',
    nameEn: 'Paleokastritsa',
    category: 'beach',
    coordinates: { lat: 39.6739, lon: 19.7106 },
  },
  {
    id: 'glyfada-beach',
    nameIt: 'Spiaggia di Glyfada',
    nameEn: 'Glyfada Beach',
    category: 'beach',
    coordinates: { lat: 39.6147, lon: 19.8556 },
  },
  {
    id: 'sidari',
    nameIt: 'Sidari (Canal d’Amour)',
    nameEn: 'Sidari (Canal d’Amour)',
    category: 'resort',
    coordinates: { lat: 39.7936, lon: 19.7036 },
  },
  {
    id: 'kavos',
    nameIt: 'Kavos',
    nameEn: 'Kavos',
    category: 'resort',
    coordinates: { lat: 39.3858, lon: 20.1147 },
  },
  {
    id: 'kassiopi',
    nameIt: 'Kassiopi',
    nameEn: 'Kassiopi',
    category: 'resort',
    coordinates: { lat: 39.7906, lon: 19.9214 },
  },
  {
    id: 'achilleion',
    nameIt: 'Palazzo Achilleion',
    nameEn: 'Achilleion Palace',
    category: 'resort',
    coordinates: { lat: 39.5639, lon: 19.8786 },
  },
  {
    id: 'barbati-beach',
    nameIt: 'Spiaggia di Barbati',
    nameEn: 'Barbati Beach',
    category: 'beach',
    coordinates: { lat: 39.7222, lon: 19.8472 },
  },
];

/** Il landmark che rappresenta il "centro" di riferimento. */
export const CORFU_CENTER = CORFU_LANDMARKS.find((l) => l.id === 'corfu-old-town')!;
export const CORFU_AIRPORT = CORFU_LANDMARKS.find((l) => l.id === 'corfu-airport')!;

/** Vista iniziale della mappa (centro storico). */
export const DEFAULT_MAP_CENTER = CORFU_CENTER.coordinates;
export const DEFAULT_MAP_ZOOM = 12;
