/**
 * Wrapper centralizzato per le chiamate di rete con:
 * - timeout configurabile (AbortController);
 * - retry con backoff esponenziale;
 * - gestione esplicita dei rate limit (HTTP 429).
 *
 * Tutte le chiamate esterne dell'app passano da qui, così da poter
 * cambiare comportamento (timeout, header) in un unico punto.
 */

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly isTimeout = false,
    public readonly isRateLimit = false,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  /** Ritardo iniziale del backoff in ms (raddoppia a ogni tentativo). */
  backoffMs?: number;
}

const DEFAULT_TIMEOUT = 12000;
const DEFAULT_RETRIES = 2;
const DEFAULT_BACKOFF = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Esegue una fetch con timeout. Lancia HttpError in caso di timeout. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new HttpError(`Timeout dopo ${timeoutMs} ms`, undefined, true);
    }
    throw new HttpError(
      err instanceof Error ? err.message : 'Errore di rete',
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scarica e interpreta una risposta JSON applicando timeout e retry.
 * I retry vengono effettuati su errori di rete, timeout, 429 e 5xx.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    backoffMs = DEFAULT_BACKOFF,
    ...init
  } = options;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const res = await fetchWithTimeout(url, init, timeoutMs);

      if (res.status === 429) {
        throw new HttpError('Troppe richieste, riprova tra poco.', 429, false, true);
      }
      if (res.status >= 500) {
        throw new HttpError(`Errore del server (${res.status}).`, res.status);
      }
      if (!res.ok) {
        throw new HttpError(`Richiesta non riuscita (${res.status}).`, res.status);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      const retriable =
        err instanceof HttpError &&
        (err.isTimeout || err.isRateLimit || (err.status ?? 0) >= 500 || err.status === undefined);
      if (!retriable || attempt === retries) break;
      await delay(backoffMs * 2 ** attempt);
      attempt += 1;
    }
  }

  throw lastError instanceof HttpError
    ? lastError
    : new HttpError('Errore sconosciuto durante la richiesta.');
}

/**
 * Restituisce un messaggio utente comprensibile a partire da un errore.
 */
export function describeError(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.isTimeout) return 'La richiesta ha impiegato troppo tempo. Riprova.';
    if (err.isRateLimit)
      return 'Troppe richieste verso il servizio gratuito. Attendi qualche secondo e riprova.';
    if (err.status === 404) return 'Nessun risultato trovato.';
    return err.message;
  }
  return 'Si è verificato un errore. Controlla la connessione e riprova.';
}
