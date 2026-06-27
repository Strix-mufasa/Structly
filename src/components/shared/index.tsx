import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 mb-4">
        <Icon className="h-8 w-8 text-brand" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <Button asChild size="sm">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button size="sm" onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="flex h-9 w-9 items-center justify-center rounded-xl border border-input hover:bg-accent transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
  return (
    <div className={`flex items-center justify-center rounded-full bg-brand/10 text-brand font-semibold ${sizes[size]}`}>
      {initials}
    </div>
  )
}

