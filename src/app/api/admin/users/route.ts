import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-guard'
import { generateToken } from '@/lib/utils'
import { sendInviteEmail } from '@/lib/email'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true,
      role: true, status: true, createdAt: true,
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { name, email, role } = await req.json()

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 })
    }

    const token = generateToken()
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 48) // 48 hours

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE',
        status: 'PENDING',
        inviteToken: token,
        inviteExpiry: expiry,
      },
    })

    await sendInviteEmail(user.email, user.name, token)

    return NextResponse.json({ id: user.id, name: user.name }, { status: 201 })
  } catch (err) {
    console.error('[admin/users POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
