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
        resetToken: token,
        resetExpiry: { gt: now },
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
        resetToken: null,
        resetExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
