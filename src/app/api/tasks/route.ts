import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireEmployee } from '@/lib/api-guard'

export async function GET() {
  const { error } = await requireEmployee()
  if (error) return error

  const tasks = await prisma.task.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return NextResponse.json(tasks)
}
