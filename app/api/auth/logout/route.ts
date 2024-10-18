import { NextResponse } from 'next/server';
import { clearSessionToken } from '@/app/utils/auth';

export async function POST() {
  clearSessionToken();

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
