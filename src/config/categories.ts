import type { CategoryDef, CategoryId } from '../types';

/**
 * Definizione delle categorie di punti di interesse.
 * Ogni categoria mappa su una o piu' query Overpass (vedi services/overpass.ts).
 */
export const CATEGORIES: CategoryDef[] = [
  {
    id: 'beach',
    labelIt: 'Spiagge',
    labelEn: 'Beaches',
    emoji: '🏖️',
    color: '#f4b400',
  },
  {
    id: 'restaurant',
    labelIt: 'Ristoranti e taverne',
    labelEn: 'Restaurants',
    emoji: '🍽️',
    color: '#db4437',
  },
  {
    id: 'bar',
    labelIt: 'Bar e locali',
    labelEn: 'Bars',
    emoji: '🍹',
    color: '#9c27b0',
  },
  {
    id: 'supermarket',
    labelIt: 'Supermercati',
    labelEn: 'Supermarkets',
    emoji: '🛒',
    color: '#0f9d58',
  },
  {
    id: 'pharmacy',
    labelIt: 'Farmacie',
    labelEn: 'Pharmacies',
    emoji: '💊',
    color: '#00897b',
  },
  {
    id: 'bus_stop',
    labelIt: 'Fermate bus',
    labelEn: 'Bus stops',
    emoji: '🚌',
    color: '#1565c0',
  },
  {
    id: 'transport',
    labelIt: 'Porti e aeroporti',
    labelEn: 'Ports & airports',
    emoji: '✈️',
    color: '#5d4037',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryDef>,
);
