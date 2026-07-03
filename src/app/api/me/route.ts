import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, jobTitle: true }
  })
  
  return NextResponse.json({ id: user?.id || '', jobTitle: user?.jobTitle || '' })
}