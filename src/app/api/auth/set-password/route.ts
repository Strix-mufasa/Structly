import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const now = new Date()
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: now },
        status: 'PENDING',
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'TOKEN_INVALID' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: 'ACTIVE',
        inviteToken: null,
        inviteExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[set-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
