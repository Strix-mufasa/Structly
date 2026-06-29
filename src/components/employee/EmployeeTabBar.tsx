'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, CalendarDays, Folder, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { useLang } from '@/lib/LanguageContext'

export default function EmployeeTabBar() {
  const pathname = usePathname()
  const { lang, t, toggleLang } = useLang()

  const tabs = [
    { href: '/dashboard', label: t.home, icon: Home },
    { href: '/projects', label: t.projects, icon: Folder },
    { href: '/log', label: t.logTime, icon: PlusCircle },
    { href: '/week', label: t.thisWeek, icon: CalendarDays },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors',
                active ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
              )}>
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              {label}
            </Link>
          )
        })}
        <button onClick={toggleLang}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          <span className="text-base">🌐</span>
          {lang === 'en' ? 'SV' : 'EN'}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t.signOut}
        </button>
      </div>
    </nav>
  )
}