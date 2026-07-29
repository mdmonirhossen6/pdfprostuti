// filepath: src/utils/auth.js
import { getDbCredentials } from './db';

export function getAdminCredentials(runtime) {
  const username = runtime?.env?.ADMIN_USERNAME || import.meta.env.ADMIN_USERNAME;
  const password = runtime?.env?.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD;
  
  // A fallback secret is defined here, but you should set a unique SESSION_SECRET in your production env variables.
  const sessionSecret = runtime?.env?.SESSION_SECRET || import.meta.env.SESSION_SECRET || 'fallback-random-string-min-32-chars-long';
  
  const db = getDbCredentials(runtime);

  return { username, password, sessionSecret, ...db };
}

/**
 * Generates a one-way SHA-256 hash token using the Web Crypto API.
 */
export async function generateToken(username, password, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${password}:${secret}`);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Verifies the admin token in cookies asynchronously.
 */
export async function verifyAuth(cookies, runtime) {
  const { username, password, sessionSecret } = getAdminCredentials(runtime);
  if (!username || !password) return false;

  const token = cookies.get('admin_token')?.value;
  if (!token) return false;

  try {
    const expectedToken = await generateToken(username, password, sessionSecret);
    return token === expectedToken;
  } catch (e) {
    return false;
  }
}