'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, CalendarDays, LogOut, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { useLang } from '@/lib/LanguageContext'
import { Lang } from '@/lib/translations'

const languageOptions: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'Svenska' },
  { value: 'et', label: 'Eesti' },
  { value: 'lv', label: 'Latviešu' },
  { value: 'pl', label: 'Polski' },
  { value: 'es', label: 'Español' },
  { value: 'uk', label: 'Українська' },
]

export default function EmployeeSidebar() {
  const pathname = usePathname()
  const { t, lang, setLang } = useLang()

  const tabs = [
    { href: '/dashboard', label: t.home, icon: Home },
    { href: '/log', label: t.logTime, icon: PlusCircle },
    { href: '/week', label: t.thisWeek, icon: CalendarDays },
  ]

  return (
    <aside className="w-56 shrink-0 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-base">Structly</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Globe className="h-4 w-4 shrink-0" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="flex-1 bg-transparent outline-none cursor-pointer text-sm"
          >
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
          <LogOut className="h-4 w-4 shrink-0" />
          {t.signOut}
        </button>
      </div>
    </aside>
  )
}