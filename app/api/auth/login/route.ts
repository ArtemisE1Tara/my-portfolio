// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSessionToken, createSessionToken, hashPassword, storeSessionToken } from '../../../utils/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Check credentials
    if (
      username === process.env.ADMIN_USERNAME &&
      hashPassword(password) === hashPassword(process.env.ADMIN_PASSWORD!)
    ) {
      // Create session token
      const sessionToken = createSessionToken(username);
      storeSessionToken(sessionToken);

      // Set cookie
      cookies().set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 1 week
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/auth/logout/route.ts
export async function logoutPOST() {
  cookies().delete('admin_session');
  clearSessionToken();
  return NextResponse.json({ success: true });
}