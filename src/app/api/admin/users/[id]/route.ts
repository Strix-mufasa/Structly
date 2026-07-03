import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, jobTitle: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  try {
    const body = await req.json()
    const { name, role, status, jobTitle } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name.trim()
    if (role !== undefined && ['ADMIN', 'EMPLOYEE'].includes(role)) data.role = role
    if (status !== undefined && ['ACTIVE', 'DISABLED', 'PENDING'].includes(status)) data.status = status
    if (jobTitle !== undefined) data.jobTitle = jobTitle || null

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, status: true, jobTitle: true },
    })
    return NextResponse.json(user)
  } catch (err) {
    console.error('[admin/users PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/users DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}