import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type') // 'invite' | 'reset'

  if (!token || !type) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const now = new Date()

  if (type === 'invite') {
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: now },
        status: 'PENDING',
      },
      select: { email: true },
    })

    if (!user) return NextResponse.json({ valid: false }, { status: 400 })
    return NextResponse.json({ valid: true, email: user.email })
  }

  if (type === 'reset') {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: now },
      },
      select: { id: true },
    })

    if (!user) return NextResponse.json({ valid: false }, { status: 400 })
    return NextResponse.json({ valid: true })
  }

  return NextResponse.json({ valid: false }, { status: 400 })
}
