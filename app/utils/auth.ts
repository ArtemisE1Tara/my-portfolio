// app/utils/auth.ts
import * as crypto from 'crypto';
import { cookies } from 'next/headers';

// Function to hash password
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + process.env.ADMIN_PASSWORD_SALT)
    .digest('hex');
}

// Function to create session token
export function createSessionToken(username: string): string {
  return crypto
    .createHash('sha256')
    .update(username + Date.now().toString() + (process.env.SESSION_SECRET || ''))
    .digest('hex');
}

// Get stored session token
export function getStoredSessionToken(): string | null {
  const token = global as { _sessionToken?: string };
  return token._sessionToken || null;
}

// Store session token
export function storeSessionToken(token: string) {
  const global_ = global as { _sessionToken?: string };
  global_._sessionToken = token;
}

// Clear session token
export function clearSessionToken() {
  const global_ = global as { _sessionToken?: string };
  delete global_._sessionToken;
}

export async function checkAuth() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session');

  return sessionToken ? true : false;
}
