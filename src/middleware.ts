import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - allow access
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/error']
  if (publicRoutes.includes(pathname) || pathname.startsWith('/register/') || pathname.startsWith('/attendance/')) {
    return NextResponse.next()
  }

  // Check for auth session cookie
  const sessionToken = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')
  
  // Protected routes - require authentication
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Note: We can't reliably check user roles in Edge Runtime middleware with NextAuth
  // Role checks should be done in the actual page components using auth() from server components

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
}
