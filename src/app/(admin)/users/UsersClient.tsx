'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/index'
import { UserStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState, Avatar } from '@/components/shared'
import { Users, Pencil } from 'lucide-react'
import UserActions from '@/components/admin/UserActions'
import { useLang } from '@/lib/LanguageContext'
import { Role, UserStatus } from '@/types'

interface UserData {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  createdAt: Date
}

export default function UsersClient({ users }: { users: UserData[] }) {
  const { t } = useLang()

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.adminUsersTitle}</h1>
          <p className="text-muted-foreground mt-1">{users.length} {t.totalAccounts}</p>
        </div>
        <Link href="/users/new">
          <Button>+ {t.addUser}</Button>
        </Link>
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t.noUsersYetTitle}
            description={t.noUsersYetDesc}
            actionLabel={t.addUser}
            actionHref="/users/new"
          />
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1fr_1fr_100px_100px_80px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>{t.nameCol}</span>
              <span>{t.emailCol}</span>
              <span>{t.roleCol}</span>
              <span>{t.statusCol}</span>
              <span>{t.actionsCol}</span>
            </div>
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_100px_80px] gap-2 md:gap-4 px-5 py-4 items-center">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                  </div>
                </div>
                <p className="hidden md:block text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                <UserStatusBadge status={user.status} />
                <div className="flex items-center gap-2">
                  <Link href={`/users/${user.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <UserActions userId={user.id} currentStatus={user.status} userName={user.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}