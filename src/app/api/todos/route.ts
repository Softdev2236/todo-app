// src/app/api/todos/route.ts
// API route that returns the logged-in user's todos as JSON.
// TanStack Query calls this for background refetches.

import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  // Step 1: Who is asking?
  const user = await getCurrentUser();

  // Step 2: Not logged in? Return 401.
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Step 3: Fetch this user's todos, newest first.
  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, user.id))
    .orderBy(desc(todos.createdAt));

  // Step 4: Return them as JSON.
  return NextResponse.json(userTodos);
}