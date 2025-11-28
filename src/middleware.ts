import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - allow access
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/error']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get session
  const session = await auth()

  // Protected routes - require authentication
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Super Admin routes - require super-admin role
  if (pathname.startsWith('/super-admin')) {
    if (session.user.role !== 'super-admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Admin routes - require admin or super-admin role
  if (pathname.startsWith('/admin')) {
    if (!['admin', 'super-admin'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
}
