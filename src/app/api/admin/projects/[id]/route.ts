import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      activities: {
        include: {
          zone: true,
          component: true,
        }
      }
    }
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { status, activityRows } = await req.json()

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.project.update({
      where: { id },
      data: { status: status || existing.status },
    })

    await prisma.activity.deleteMany({ where: { projectId: id } })
    await prisma.projectComponent.deleteMany({ where: { projectId: id } })
    await prisma.zone.deleteMany({ where: { projectId: id } })

    const rows = Array.isArray(activityRows) ? activityRows : []

    for (const row of rows) {
      const ids: string[] = Array.isArray(row.componentIds) ? row.componentIds : []

      let createdZone = null
      if (row.zone) {
        createdZone = await prisma.zone.create({
          data: { id: crypto.randomUUID(), name: row.zone, projectId: id },
        })
      }

      if (ids.length > 0) {
        await prisma.projectComponent.createMany({
          data: ids.map((componentId: string) => ({
            id: crypto.randomUUID(),
            projectId: id,
            componentId,
          })),
          skipDuplicates: true,
        })
      }

      if (row.activityName && createdZone && ids.length > 0) {
        await prisma.activity.createMany({
          data: ids.map((componentId: string) => ({
            id: crypto.randomUUID(),
            name: row.activityName,
            zoneId: createdZone!.id,
            componentId,
            projectId: id,
          })),
        })
      }
    }

    const project = await prisma.project.findUniqueOrThrow({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        activities: { include: { zone: true, component: true } },
      },
    })

    return NextResponse.json(project)
  } catch (err) {
    console.error('[admin/projects/[id] PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}