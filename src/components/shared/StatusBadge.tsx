import { Badge } from '@/components/ui/index'
import { UserStatus, TaskStatus } from '@/types'

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { label: string; variant: 'success' | 'warning' | 'muted' }> = {
    ACTIVE: { label: 'Active', variant: 'success' },
    PENDING: { label: 'Pending', variant: 'warning' },
    DISABLED: { label: 'Disabled', variant: 'muted' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'muted'}>
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </Badge>
  )
}

