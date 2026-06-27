import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditUserForm from '@/components/admin/EditUserForm'

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, status: true },
  })
  if (!user) notFound()
  return <EditUserForm user={user} />
}