import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await prisma.project.findMany({
    where: {
      status: 'PUBLISHED',
      members: { some: { userId: session.user.id } },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } }
        }
      },
      activities: { include: { zone: true, component: true } },
      zones: true,
    },
  })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, assignedUserIds, date, status } = await req.json()
  if (!name || !Array.isArray(assignedUserIds) || assignedUserIds.length === 0 || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const project = await prisma.project.create({
    data: {
      name,
      date: new Date(date),
      status: status || 'DRAFT',
      members: { create: assignedUserIds.map((userId: string) => ({ userId })) },
    },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
          user: { select: { id: true, name: true, email: true } }
        }
      },
      activities: { include: { zone: true, component: true } },
      zones: true,
    },
  })
  return NextResponse.json(project)
}