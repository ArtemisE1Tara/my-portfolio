// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSessionExpired } from '@/app/utils/auth';
import { logger } from '@/app/utils/logger';

export function middleware(request: NextRequest) {
  try {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isLoginRoute = request.nextUrl.pathname === '/admin/login';
    const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (isAdminRoute) {
      if (isLoginRoute || isAuthRoute) {
        // If user is already logged in, redirect to dashboard
        if (sessionToken && !isSessionExpired(sessionToken)) {
          logger.info('Redirecting logged-in user to dashboard');
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.next();
      }

      // For all other admin routes, check for valid session
      if (!sessionToken || isSessionExpired(sessionToken)) {
        logger.warn('Unauthorized access attempt to admin route');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    logger.error('Error in middleware', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
