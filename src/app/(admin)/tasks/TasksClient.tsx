'use client'
import { Card } from '@/components/ui/index'
import { TaskStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared'
import { ListTodo } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'
import { TaskRowActions } from '@/components/admin/CreateTaskModal'
import { Task } from '@prisma/client'

interface TaskData {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

export default function TasksClient({ tasks, modal }: { tasks: TaskData[], modal: React.ReactNode }) {
  const { t } = useLang()

  const active = tasks.filter(t => t.status === 'ACTIVE')
  const inactive = tasks.filter(t => t.status === 'INACTIVE')

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.adminTasksTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {active.length} {t.activeLabel} · {inactive.length} {t.inactiveLabel}
          </p>
        </div>
        {modal}
      </div>

      <Card>
        {tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={t.noTasksYetTitle}
            description={t.noTasksYetDesc}
          />
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>{t.taskNameCol}</span>
              <span>{t.statusCol}</span>
              <span>{t.createdCol}</span>
              <span>{t.actionsCol}</span>
            </div>
            {tasks.map(task => (
              <div key={task.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_100px] gap-2 md:gap-4 px-5 py-4 items-center">
                <p className="text-sm font-medium">{task.name}</p>
                <TaskStatusBadge status={task.status} />
                <p className="text-xs text-muted-foreground">{task.createdAt}</p>
                <TaskRowActions task={task as unknown as Task} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}