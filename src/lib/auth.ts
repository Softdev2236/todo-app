// src/lib/auth.ts
// Handles password hashing/verification and fetching the current user
// from the database using the session cookie.

import 'server-only';
import { cache } from 'react';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { getSessionId } from './session';
import type { User } from '@/db/schema';

// ─────────────────────────────────────────────
// 1. HASH A PASSWORD
// Used during sign-up. Turns "mypassword123" into an unreadable hash.
// ─────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ─────────────────────────────────────────────
// 2. VERIFY A PASSWORD
// Used during sign-in. Checks a plain password against a stored hash.
// ─────────────────────────────────────────────
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─────────────────────────────────────────────
// 3. GET THE CURRENT USER
// The most important function in the app.
// Reads the session cookie, looks up the session in the DB,
// then fetches the matching user. Returns null if not logged in.
// Wrapped in React `cache` so it only runs once per request.
// ─────────────────────────────────────────────
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const sessionId = await getSessionId();
  if (!sessionId) return null;

  // Find the session row.
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const session = sessionRows[0];
  if (!session) return null;

  // Check it hasn't expired.
  if (session.expiresAt < new Date()) {
    return null;
  }

  // Look up the user.
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return userRows[0] ?? null;
});