import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const publicRoutes = ['/login', '/set-password', '/forgot-password', '/reset-password']

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    if (session) {
      const role = session.user?.role
      return NextResponse.redirect(
        new URL(role === 'ADMIN' ? '/admin' : '/dashboard', req.url)
      )
    }
    return NextResponse.next()
  }

  if (pathname === '/') {
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.redirect(
      new URL(session.user?.role === 'ADMIN' ? '/admin' : '/dashboard', req.url)
    )
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = session.user?.role

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/dashboard') && role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}