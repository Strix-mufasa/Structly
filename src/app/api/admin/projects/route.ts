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

  try {
    const { name, assignedUserIds, memberRoles, date, status, activityRows } = await req.json()
    if (!name || !Array.isArray(assignedUserIds) || assignedUserIds.length === 0 || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const roles: Record<string, string> = memberRoles || {}

    // Step 1 - Project banao
    const createdProject = await prisma.project.create({
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

    // Step 2 - Saari rows process karo
    const rows = Array.isArray(activityRows) ? activityRows : []

    for (const row of rows) {
      const ids: string[] = Array.isArray(row.componentIds) ? row.componentIds : []

      // Zone banao
      let createdZone = null
      if (row.zone) {
        createdZone = await prisma.zone.create({
          data: { name: row.zone, projectId: createdProject.id },
        })
      }

      // Components link karo
      if (ids.length > 0) {
        await prisma.projectComponent.createMany({
          data: ids.map((componentId: string) => ({
            projectId: createdProject.id,
            componentId,
          })),
          skipDuplicates: true,
        })
      }

      // Activities banao
      if (row.activityName && createdZone && ids.length > 0) {
        await prisma.activity.createMany({
          data: ids.map((componentId: string) => ({
            name: row.activityName,
            zoneId: createdZone!.id,
            componentId,
            projectId: createdProject.id,
          })),
        })
      }
    }

    // Final project return karo
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: createdProject.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        zones: true,
        projectComponents: { include: { component: true } },
      },
    })

    return NextResponse.json(project)
  } catch (err) {
    console.error('[admin/projects POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}