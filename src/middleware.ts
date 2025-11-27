import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // If there's a JWT error cookie, clear all auth cookies
  const authCookie = request.cookies.get('authjs.session-token') || 
                     request.cookies.get('__Secure-authjs.session-token');
  
  // For auth pages, if there's an old cookie that might cause issues,
  // clear it by setting it to expire
  if (request.nextUrl.pathname.startsWith('/auth/') && authCookie) {
    response.cookies.set('authjs.session-token', '', { 
      maxAge: 0,
      path: '/' 
    });
    response.cookies.set('__Secure-authjs.session-token', '', { 
      maxAge: 0,
      path: '/',
      secure: true 
    });
  }
  
  return response;
}

export const config = {
  matcher: ['/auth/:path*'],
};
