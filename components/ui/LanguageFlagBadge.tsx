const LANGUAGES: Record<string, { flag: string; name: string }> = {
  nl: { flag: '🇳🇱', name: 'Dutch' },
  fr: { flag: '🇫🇷', name: 'French' },
  de: { flag: '🇩🇪', name: 'German' },
  es: { flag: '🇪🇸', name: 'Spanish' },
  it: { flag: '🇮🇹', name: 'Italian' },
}

// Hardcoded to Dutch until multi-language support is added.
const ACTIVE_LANGUAGE = 'nl'

export default function LanguageFlagBadge() {
  const lang = LANGUAGES[ACTIVE_LANGUAGE]
  if (!lang) return null

  return (
    <div className="pointer-events-none flex items-center gap-1.5 bg-white/10 border border-white/[0.15] rounded-full px-2.5 py-1 shrink-0">
      <span className="text-base leading-none">{lang.flag}</span>
      <span className="text-xs font-bold text-white/[0.85]">{lang.name}</span>
    </div>
  )
}
