import type { SavedRental } from '../types';
import { isValidCoordinates } from './distance';

const STORAGE_KEY = 'corfu-rentals:v1';

/**
 * Verifica che un oggetto generico abbia la forma di SavedRental.
 * Protegge da dati corrotti o manomessi in localStorage.
 */
function isSavedRental(value: unknown): value is SavedRental {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.sourceUrl === 'string' &&
    isValidCoordinates(r.coordinates as never) &&
    typeof r.metrics === 'object' &&
    r.metrics !== null
  );
}

/** Legge tutti gli alloggi salvati. Restituisce array vuoto in caso di errore. */
export function loadRentals(): SavedRental[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedRental);
  } catch {
    return [];
  }
}

/** Sovrascrive l'elenco completo degli alloggi salvati. */
export function saveRentals(rentals: SavedRental[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rentals));
  } catch {
    // Storage pieno o non disponibile: l'app continua a funzionare in memoria.
  }
}

/** Aggiunge o aggiorna un alloggio e restituisce la nuova lista. */
export function upsertRental(
  rentals: SavedRental[],
  rental: SavedRental,
): SavedRental[] {
  const idx = rentals.findIndex((r) => r.id === rental.id);
  const next = idx >= 0 ? rentals.map((r) => (r.id === rental.id ? rental : r)) : [...rentals, rental];
  saveRentals(next);
  return next;
}

/** Rimuove un alloggio per id e restituisce la nuova lista. */
export function removeRental(rentals: SavedRental[], id: string): SavedRental[] {
  const next = rentals.filter((r) => r.id !== id);
  saveRentals(next);
  return next;
}

/** Rinomina un alloggio e restituisce la nuova lista. */
export function renameRental(
  rentals: SavedRental[],
  id: string,
  name: string,
): SavedRental[] {
  const next = rentals.map((r) => (r.id === id ? { ...r, name } : r));
  saveRentals(next);
  return next;
}
