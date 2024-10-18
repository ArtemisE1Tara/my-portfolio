// app/utils/auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as crypto from 'crypto';

// Function to hash password
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + process.env.ADMIN_PASSWORD_SALT || '')
    .digest('hex');
}

// Function to create session token
export function createSessionToken(username: string): string {
  return crypto
    .createHash('sha256')
    .update(username + Date.now().toString() + (process.env.SESSION_SECRET || ''))
    .digest('hex');
}

// Middleware to check authentication
export async function checkAuth() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session');
  
  if (!sessionToken || sessionToken.value !== getStoredSessionToken()) {
    redirect('/admin/login');
  }
}

// Get stored session token
export function getStoredSessionToken(): string | null {
  const token = global as any;
  return token._sessionToken || null;
}

// Store session token
export function storeSessionToken(token: string) {
  const global_ = global as any;
  global_._sessionToken = token;
}

// Clear session token
export function clearSessionToken() {
  const global_ = global as any;
  delete global_._sessionToken;
}