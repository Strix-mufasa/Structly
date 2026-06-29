'use client'
import { createContext, useContext, useState } from 'react'
import { translations, Lang } from './translations'

const LanguageContext = createContext<{
  lang: Lang
  t: typeof translations.en
  toggleLang: () => void
}>({ lang: 'en', t: translations.en, toggleLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('sv')
  const toggleLang = () => setLang(l => l === 'en' ? 'sv' : 'en')
  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)