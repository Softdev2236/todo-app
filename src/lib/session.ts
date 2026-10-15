// src/lib/session.ts
// Handles creating, reading, and deleting the session cookie.

import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// ─── Config ────────────────────────────────────────────────

const COOKIE_NAME = 'todo_session';
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set. Check your .env.local file.');
}

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET);

// ─── Create a new session ──────────────────────────────────
// Called after sign-up or sign-in. Creates a DB row and sets a cookie.

export async function createSession(userId: string): Promise<string> {
  // Step 1: Generate a random session ID (64 hex characters).
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Step 2: Save the session in the database.
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  // Step 3: Sign a JWT containing the session ID.
  const token = await new SignJWT({ sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(secretKey);

  // Step 4: Set the JWT as an HTTP-only cookie.
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return sessionId;
}

// ─── Read the current session ──────────────────────────────
// Returns the session ID from the cookie, or null if missing/invalid.

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const sessionId = payload.sessionId as string | undefined;
    return sessionId ?? null;
  } catch {
    // Expired or tampered cookie.
    return null;
  }
}

// ─── Delete the current session ────────────────────────────
// Called on sign-out. Deletes the DB row and clears the cookie.

export async function deleteSession(): Promise<void> {
  const sessionId = await getSessionId();

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}