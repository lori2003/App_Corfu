import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeUrl, escapeHtml, parseCoordinates } from './sanitize';

describe('sanitizeText', () => {
  it('comprime gli spazi e taglia alla lunghezza massima', () => {
    expect(sanitizeText('  ciao    mondo  ')).toBe('ciao mondo');
    expect(sanitizeText('abcdef', 3)).toBe('abc');
  });
});

describe('sanitizeUrl', () => {
  it('accetta http(s) e normalizza', () => {
    expect(sanitizeUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(sanitizeUrl('example.com')).toBe('https://example.com/');
  });

  it('rifiuta schemi pericolosi', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,abc')).toBeNull();
    expect(sanitizeUrl('   ')).toBeNull();
  });
});

describe('escapeHtml', () => {
  it('esegue l’escape dei caratteri speciali', () => {
    expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
    expect(escapeHtml("a & b ' c")).toBe('a &amp; b &#39; c');
  });
});

describe('parseCoordinates', () => {
  it('interpreta i formati comuni', () => {
    expect(parseCoordinates('39.6243, 19.9217')).toEqual({ lat: 39.6243, lon: 19.9217 });
    expect(parseCoordinates('39.6 19.9')).toEqual({ lat: 39.6, lon: 19.9 });
    expect(parseCoordinates('lat=39.6,lon=-19.9')).toEqual({ lat: 39.6, lon: -19.9 });
  });

  it('rifiuta valori non validi o fuori range', () => {
    expect(parseCoordinates('')).toBeNull();
    expect(parseCoordinates('solo testo')).toBeNull();
    expect(parseCoordinates('200, 19')).toBeNull();
    expect(parseCoordinates('39.6')).toBeNull();
  });
});
