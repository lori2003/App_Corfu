import { it, type Translations } from './it';
import { en } from './en';

export type Language = 'it' | 'en';

export const translations: Record<Language, Translations> = { it, en };

/** Lingua predefinita dell'app. */
export const DEFAULT_LANGUAGE: Language = 'it';

export type { Translations };
