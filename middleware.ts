// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page and API routes
    if (
      request.nextUrl.pathname === '/admin/login' ||
      request.nextUrl.pathname.startsWith('/api/auth')
    ) {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const session = request.cookies.get('admin_session');
    if (!session) {
      // Redirect to login if no session exists
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};