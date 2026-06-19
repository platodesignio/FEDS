'use client'

import { useAudit } from '@/lib/auditContext'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useAudit()
  return (
    <div className="inline-flex border border-[#e2e8f0] text-sm">
      {(['en', 'ja'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 ${
            locale === l ? 'bg-[#1a3a5c] text-white' : 'bg-white text-gray-700'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
