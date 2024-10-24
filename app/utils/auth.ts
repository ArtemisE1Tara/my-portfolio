// app/utils/auth.ts
import * as crypto from 'crypto';
import { cookies } from 'next/headers';
import { logger } from './logger';
import jwt from 'jsonwebtoken';

// Function to hash password
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + process.env.ADMIN_PASSWORD_SALT)
    .digest('hex');
}

// Function to create session token
export function createSessionToken(username: string): string {
  const expirationTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now
  return jwt.sign({ username, exp: expirationTime }, process.env.SESSION_SECRET || 'fallback_secret');
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
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session');

    if (sessionToken && !isSessionExpired(sessionToken.value)) {
      logger.info('Valid session found');
      return true;
    } else {
      logger.info('No valid session found');
      return false;
    }
  } catch (error) {
    logger.error('Error checking authentication', error);
    return false;
  }
}

export function isSessionExpired(sessionToken: string): boolean {
  try {
    const decodedToken = jwt.decode(sessionToken) as jwt.JwtPayload;
    if (!decodedToken || typeof decodedToken.exp === 'undefined') {
      logger.warn('Invalid token structure');
      return true;
    }
    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
    return Date.now() > expirationTime;
  } catch (error) {
    logger.error('Error checking session expiration', error);
    return true; // If there's any error parsing the token, consider it expired
  }
}
