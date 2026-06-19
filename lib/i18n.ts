import { translations } from '@/data/translations'
import { Locale } from '@/types/i18n'

export function t(key: string, locale: Locale): string {
  const entry = translations[key]
  if (!entry) return key
  return entry[locale] ?? entry['en'] ?? key
}
