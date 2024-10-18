// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const session = request.cookies.get('admin_session');

  if (isAdminRoute) {
    if (isLoginRoute || isAuthRoute) {
      // If user is already logged in, redirect to dashboard
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // For all other admin routes, check for session
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
