import { describe, it, expect } from 'vitest';
import { parseListingLink } from './linkParser';

describe('parseListingLink', () => {
  it('estrae le coordinate da un link di Google Maps (@lat,lon)', () => {
    const r = parseListingLink('https://www.google.com/maps/@39.6243,19.9217,15z');
    expect(r.coordinates).toEqual({ lat: 39.6243, lon: 19.9217 });
    expect(r.needsManualInput).toBe(false);
    expect(r.provider).toBe('google');
  });

  it('estrae le coordinate dal pattern !3d!4d di Google Maps', () => {
    const r = parseListingLink(
      'https://www.google.com/maps/place/Corfu/data=!3d39.6243!4d19.9217',
    );
    expect(r.coordinates).toEqual({ lat: 39.6243, lon: 19.9217 });
  });

  it('estrae coordinate da parametri lat/lon generici', () => {
    const r = parseListingLink('https://example.com/x?latitude=39.6&longitude=19.9');
    expect(r.coordinates).toEqual({ lat: 39.6, lon: 19.9 });
  });

  it('riconosce Booking.com e richiede input manuale', () => {
    const r = parseListingLink('https://www.booking.com/hotel/gr/villa-corfu.it.html');
    expect(r.coordinates).toBeNull();
    expect(r.provider).toBe('booking');
    expect(r.needsManualInput).toBe(true);
    expect(r.message).toMatch(/Booking/i);
  });

  it('riconosce Airbnb e richiede input manuale', () => {
    const r = parseListingLink('https://www.airbnb.it/rooms/12345678');
    expect(r.coordinates).toBeNull();
    expect(r.provider).toBe('airbnb');
    expect(r.needsManualInput).toBe(true);
  });

  it('gestisce un link non valido', () => {
    const r = parseListingLink('non-un-url valido con spazi');
    expect(r.provider).toBe('invalid');
    expect(r.needsManualInput).toBe(true);
  });

  it('ricava un nome indicativo dallo slug del percorso', () => {
    const r = parseListingLink('https://www.booking.com/hotel/gr/villa-bella-corfu.it.html');
    expect(r.name).toMatch(/villa bella corfu/i);
  });
});
