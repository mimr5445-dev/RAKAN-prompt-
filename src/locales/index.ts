/**
 * RAKAN Prompt - Localization Manager
 */
import { ar } from './ar';
import { en } from './en';
import { Language } from '../types';

export type TranslationKey = keyof typeof ar;

export function getTranslation(lang: Language, key: TranslationKey): string {
  const dict = lang === 'en' ? en : ar;
  return dict[key] || ar[key] || key;
}

export { ar, en };
