// src/app/actions/auth.ts
// Server Actions for sign-up, sign-in, and sign-out.

'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { createSession, deleteSession } from '@/lib/session';

// ─── Validation rules ──────────────────────────────────────

const signUpSchema = z.object({
  email: z.string().email('Invalid email').max(256),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// The shape of what these actions return to the form.
type AuthResult = {
  errors?: Record<string, string[]>;
  message?: string;
};

// ─── SIGN UP ───────────────────────────────────────────────

export async function signUp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  // Step 1: Pull data out of the form.
  const email = formData.get('email');
  const password = formData.get('password');

  // Step 2: Validate.
  const validated = signUpSchema.safeParse({ email, password });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const validEmail = validated.data.email;
  const validPassword = validated.data.password;

  // Step 3: Check if the email is already taken.
  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, validEmail))
    .limit(1);

  if (existingUsers.length > 0) {
    return { errors: { email: ['This email is already registered'] } };
  }

  // Step 4: Hash the password.
  const passwordHash = await hashPassword(validPassword);

  // Step 5: Insert the new user.
  const insertedUsers = await db
    .insert(users)
    .values({ email: validEmail, passwordHash })
    .returning({ id: users.id });

  const newUser = insertedUsers[0];

  if (!newUser) {
    return { message: 'Failed to create account. Please try again.' };
  }

  // Step 6: Log them in.
  await createSession(newUser.id);

  // Step 7: Send them home.
  redirect('/');
}

// ─── SIGN IN ───────────────────────────────────────────────

export async function signIn(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  // Step 1: Pull data out of the form.
  const email = formData.get('email');
  const password = formData.get('password');

  // Step 2: Validate.
  const validated = signInSchema.safeParse({ email, password });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const validEmail = validated.data.email;
  const validPassword = validated.data.password;

  // Step 3: Find the user.
  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, validEmail))
    .limit(1);

  const user = foundUsers[0];

  // Step 4: If no user, return generic error.
  if (!user) {
    return { message: 'Invalid email or password' };
  }

  // Step 5: Check the password.
  const passwordIsCorrect = await verifyPassword(
    validPassword,
    user.passwordHash
  );

  if (!passwordIsCorrect) {
    return { message: 'Invalid email or password' };
  }

  // Step 6: Log them in.
  await createSession(user.id);

  // Step 7: Send them home.
  redirect('/');
}

// ─── SIGN OUT ──────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await deleteSession();
  redirect('/sign-in');
}