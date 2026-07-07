import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireEmployee } from '@/lib/api-guard'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const { error, session } = await requireEmployee()
  if (error) return error
  const { searchParams } = new URL(req.url)
  const userId = session!.user.id
  const dateParam = searchParams.get('date')
  const weekOf = searchParams.get('weekOf')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '30')
  const where: Record<string, unknown> = { userId }
  if (dateParam === 'today') {
    const now = new Date()
    where.date = { gte: startOfDay(now), lte: endOfDay(now) }
  } else if (dateParam) {
    const d = parseISO(dateParam)
    where.date = { gte: startOfDay(d), lte: endOfDay(d) }
  }
  if (weekOf) {
    const base = parseISO(weekOf)
    where.date = {
      gte: startOfWeek(base, { weekStartsOn: 1 }),
      lte: endOfWeek(base, { weekStartsOn: 1 }),
    }
  }
  const entries = await prisma.timeEntry.findMany({
    where,
    orderBy: { date: 'desc' },
    skip: weekOf || dateParam ? 0 : (page - 1) * limit,
    take: weekOf || dateParam ? undefined : limit,
    include: { task: { select: { id: true, name: true } } },
  })
  const normalised = entries.map((e) => ({
    ...e,
    hours: Number(e.hours),
    date: e.date.toISOString(),
  }))
  return NextResponse.json(normalised)
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireEmployee()
  if (error) return error
  try {
    const { date, activityId, hours, startTime, endTime, comment, projectId, zoneId, wastedHoursReason } = await req.json()

    if (!date || !activityId || !hours) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }
    const h = parseFloat(String(hours))
    if (isNaN(h) || h <= 0 || h > 24) {
      return NextResponse.json({ error: 'INVALID_HOURS' }, { status: 400 })
    }

    // Activity now plays the role of "task" — look it up
    const activity = await prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) {
      return NextResponse.json({ error: 'INVALID_ACTIVITY' }, { status: 400 })
    }

    const entryDate = parseISO(date)
    const today = endOfDay(new Date())
    if (entryDate > today) {
      return NextResponse.json({ error: 'FUTURE_DATE' }, { status: 400 })
    }

    // Find or create a Task record matching this activity's name
    // (TimeEntry.taskId is a required FK, so we keep it in sync automatically)
    let task = await prisma.task.findUnique({ where: { name: activity.name } })
    if (!task) {
      task = await prisma.task.create({
        data: { id: randomUUID(), name: activity.name, status: 'ACTIVE', updatedAt: new Date() },
      })
    }

    const entry = await prisma.timeEntry.create({
      data: {
        id: randomUUID(),
        userId: session!.user.id,
        taskId: task.id,
        date: entryDate,
        hours: h,
        startTime: startTime || null,
        endTime: endTime || null,
        comment: comment?.trim() || null,
        activityId,
        projectId: projectId || null,
        zoneId: zoneId || null,
        wastedHoursReason: wastedHoursReason || null,
        updatedAt: new Date(),
      },
      include: { task: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ ...entry, hours: Number(entry.hours) }, { status: 201 })
  } catch (err) {
    console.error('[entries POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}