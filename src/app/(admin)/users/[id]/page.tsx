import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditUserForm from '@/components/admin/EditUserForm'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, jobTitle: true },
  })
  if (!user) notFound()
  return <EditUserForm user={user} />
}