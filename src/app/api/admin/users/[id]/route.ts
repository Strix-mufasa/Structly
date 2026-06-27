import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await req.json()
    const { name, role, status } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name.trim()
    if (role !== undefined && ['ADMIN', 'EMPLOYEE'].includes(role)) data.role = role
    if (status !== undefined && ['ACTIVE', 'DISABLED', 'PENDING'].includes(status)) data.status = status

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, status: true },
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error('[admin/users PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/users DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
