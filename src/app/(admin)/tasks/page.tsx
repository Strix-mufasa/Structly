import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import CreateTaskModal from '@/components/admin/CreateTaskModal'
import TasksClient from './TasksClient'

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })

  const data = tasks.map(t => ({
    id: t.id,
    name: t.name,
    status: t.status,
    createdAt: formatDate(t.createdAt),
  }))

  return (
    <div className="animate-fade-in">
      <TasksClient tasks={data} modal={<CreateTaskModal />} />
    </div>
  )
}