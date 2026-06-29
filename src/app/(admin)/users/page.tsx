import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  })

  return <UsersClient users={users} />
}