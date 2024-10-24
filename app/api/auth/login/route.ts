// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { hashPassword, createSessionToken } from '@/app/utils/auth';
import { logger } from '@/app/utils/logger';

export async function POST(request: Request) {
  try {
    const { username, password, rememberMe } = await request.json();

    // Validate credentials (replace with your actual validation logic)
    const validUsername = process.env.ADMIN_USERNAME;
    const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (username === validUsername && hashPassword(password) === validPasswordHash) {
      const sessionToken = createSessionToken(username);

      const response = NextResponse.json({ success: true });
      
      // Set session expiration based on rememberMe option
      const expirationDate = rememberMe
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expirationDate,
        path: '/',
      });

      logger.info(`Successful login attempt for user: ${username}`);
      return response;
    } else {
      logger.warn(`Failed login attempt for user: ${username}`);
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    logger.error('Error in login process', error);
    return NextResponse.json({ success: false, message: 'An error occurred during login' }, { status: 500 });
  }
}



