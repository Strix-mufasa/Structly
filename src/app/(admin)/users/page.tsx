import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/index'
import { UserStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState, Avatar } from '@/components/shared'
import { Users, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import UserActions from '@/components/admin/UserActions'

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } })
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Users</h1><p className="text-muted-foreground mt-1">{users.length} total accounts</p></div>
        <Link href="/users/new"><Button>+ Add User</Button></Link>
      </div>
      <Card>
        {users.length === 0 ? <EmptyState icon={Users} title="No users yet" description="Add your first user to get started." actionLabel="Add User" actionHref="/users/new" /> : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1fr_1fr_100px_100px_80px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
            </div>
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_100px_80px] gap-2 md:gap-4 px-5 py-4 items-center">
                <div className="flex items-center gap-3"><Avatar name={user.name} size="sm" /><div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-muted-foreground md:hidden">{user.email}</p></div></div>
                <p className="hidden md:block text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                <UserStatusBadge status={user.status} />
                <div className="flex items-center gap-2">
                  <Link href={`/users/${user.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent transition-colors"><Pencil className="h-3.5 w-3.5" /></Link>
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