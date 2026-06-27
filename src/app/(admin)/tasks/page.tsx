import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/index'
import { TaskStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared'
import { ListTodo } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateTaskModal from '@/components/admin/CreateTaskModal'
import { TaskRowActions } from '@/components/admin/CreateTaskModal'
export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })
  const active = tasks.filter(t => t.status === 'ACTIVE')
  const inactive = tasks.filter(t => t.status === 'INACTIVE')
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Tasks</h1><p className="text-muted-foreground mt-1">{active.length} active · {inactive.length} inactive</p></div>
        <CreateTaskModal />
      </div>
      <Card>
        {tasks.length === 0 ? <EmptyState icon={ListTodo} title="No tasks yet" description="Add your first task. Employees will select from these when logging time." /> : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Task Name</span><span>Status</span><span>Created</span><span>Actions</span>
            </div>
            {tasks.map(task => (
              <div key={task.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_100px] gap-2 md:gap-4 px-5 py-4 items-center">
                <p className="text-sm font-medium">{task.name}</p>
                <TaskStatusBadge status={task.status} />
                <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
                <TaskRowActions task={task} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

