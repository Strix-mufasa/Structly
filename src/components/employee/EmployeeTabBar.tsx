'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, CalendarDays, History, Folder, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/projects', label: 'Projects', icon: Folder },
  { href: '/log', label: 'Log Time', icon: PlusCircle },
  { href: '/week', label: 'This Week', icon: CalendarDays },
  { href: '/history', label: 'History', icon: History },
  { href: '/login', label: 'Sign Out', icon: LogOut }
]

export default function EmployeeTabBar() {
  const pathname = usePathname()
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
      </div>
    </nav>
  )
}