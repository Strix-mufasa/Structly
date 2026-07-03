import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      zones: true,
      projectComponents: { include: { component: true } },
    },
  })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, assignedUserIds, memberRoles, date, status, zone, taskName, componentIds } = await req.json()
  if (!name || !Array.isArray(assignedUserIds) || assignedUserIds.length === 0 || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const ids: string[] = Array.isArray(componentIds) ? componentIds : []
  const roles: Record<string, string> = memberRoles || {}

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name,
        date: new Date(date),
        status: status || 'DRAFT',
        members: {
          create: assignedUserIds.map((userId: string) => ({
            userId,
            role: roles[userId] || null,
          }))
        },
      },
    })

    let createdZone = null
    if (zone) {
      createdZone = await tx.zone.create({
        data: { name: zone, projectId: createdProject.id },
      })
    }

    if (ids.length > 0) {
      await tx.projectComponent.createMany({
        data: ids.map((componentId) => ({
          projectId: createdProject.id,
          componentId,
        })),
      })
    }

    if (taskName && createdZone && ids.length > 0) {
      await tx.activity.createMany({
        data: ids.map((componentId) => ({
          name: taskName,
          zoneId: createdZone!.id,
          componentId,
          projectId: createdProject.id,
        })),
      })
    }

    return tx.project.findUniqueOrThrow({
      where: { id: createdProject.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        zones: true,
        projectComponents: { include: { component: true } },
      },
    })
  })
  return NextResponse.json(project)
}