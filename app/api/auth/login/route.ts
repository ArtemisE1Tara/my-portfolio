// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { hashPassword, createSessionToken } from '@/app/utils/auth';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Validate credentials (replace with your actual validation logic)
  const validUsername = process.env.ADMIN_USERNAME;
  const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (username === validUsername && hashPassword(password) === validPasswordHash) {
    const sessionToken = createSessionToken(username);

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } else {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }
}



