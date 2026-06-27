'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ListTodo, Clock, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/shared'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/entries', label: 'Time Entries', icon: Clock },
]

export default function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname()
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">Structly</p>
          <p className="text-[11px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  )
}