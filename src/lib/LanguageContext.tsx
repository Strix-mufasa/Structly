'use client'
import { createContext, useContext, useState } from 'react'
import { translations, Lang } from './translations'

const LanguageContext = createContext<{
  lang: Lang
  t: typeof translations.en
  setLang: (lang: Lang) => void
}>({ lang: 'en', t: translations.en, setLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)