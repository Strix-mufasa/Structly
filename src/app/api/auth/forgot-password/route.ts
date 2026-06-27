import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/utils'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: true }) // Don't reveal missing email
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return 200 — no email enumeration
    if (!user || user.status === 'DISABLED') {
      return NextResponse.json({ success: true })
    }

    const token = generateToken()
    const expiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpiry: expiry },
    })

    await sendPasswordResetEmail(user.email, user.name, token)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ success: true }) // Still 200 — no leak
  }
}
