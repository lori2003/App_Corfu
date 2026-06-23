import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPois } from './overpass';

const center = { lat: 39.6243, lon: 19.9217 };

function mockFetchOnce(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as Response);
}

describe('fetchPois (gestione risposte)', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restituisce [] senza categorie senza chiamare la rete', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const pois = await fetchPois([], center, 1000);
    expect(pois).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('gestisce una risposta vuota', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({ elements: [] }));
    const pois = await fetchPois(['restaurant'], center, 1000);
    expect(pois).toEqual([]);
  });

  it('scarta elementi senza coordinate o senza tag riconosciuti', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({
        elements: [
          { type: 'node', id: 1 }, // niente coordinate → scartato
          { type: 'node', id: 2, lat: 39.62, lon: 19.92, tags: { foo: 'bar' } }, // tag non mappato
          {
            type: 'node',
            id: 3,
            lat: 39.625,
            lon: 19.922,
            tags: { amenity: 'restaurant', name: 'Taverna' },
          },
        ],
      }),
    );
    const pois = await fetchPois(['restaurant'], center, 1000);
    expect(pois).toHaveLength(1);
    expect(pois[0].name).toBe('Taverna');
    expect(pois[0].category).toBe('restaurant');
    expect(pois[0].distanceMeters).toBeGreaterThanOrEqual(0);
  });

  it('usa un nome predefinito quando manca il tag name', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({
        elements: [
          {
            type: 'way',
            id: 5,
            center: { lat: 39.63, lon: 19.93 },
            tags: { shop: 'supermarket' },
          },
        ],
      }),
    );
    const pois = await fetchPois(['supermarket'], center, 1000);
    expect(pois).toHaveLength(1);
    expect(pois[0].name).toBe('Supermercato');
  });
});
