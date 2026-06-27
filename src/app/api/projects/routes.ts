import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, assignedTo, date, status } = await req.json()
  if (!name || !assignedTo || !date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const project = await prisma.project.create({ data: { name, assignedTo, date: new Date(date), status: status || 'DRAFT' } })
  return NextResponse.json(project)
}