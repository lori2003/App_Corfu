import { useEffect, useState } from 'react';

/**
 * Restituisce una versione "ritardata" del valore: utile per il debounce
 * delle ricerche (es. geocodifica mentre si digita), così da non inviare
 * una richiesta a ogni tasto premuto.
 */
export function useDebouncedValue<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
