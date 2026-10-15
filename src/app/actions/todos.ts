// src/app/actions/todos.ts
// Server Actions for creating, toggling, and deleting todos.
// Every action checks that the user is logged in AND owns the todo.

'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

// ─── Validation ────────────────────────────────────────────

const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Please write something')
    .max(200, 'Keep it under 200 characters'),
});

// This is what createTodo returns to the form.
export type TodoActionResult = {
  errors?: Record<string, string[]>;
  success?: boolean;
};

// ─── CREATE TODO ───────────────────────────────────────────

export async function createTodo(
  _prevState: TodoActionResult,
  formData: FormData
): Promise<TodoActionResult> {
  // Step 1: Who is asking?
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { title: ['You must be logged in'] } };
  }

  // Step 2: Get the title from the form.
  const title = formData.get('title');

  // Step 3: Validate.
  const validated = createTodoSchema.safeParse({ title });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const validTitle = validated.data.title;

  // Step 4: Insert into the database.
  await db.insert(todos).values({
    userId: user.id,
    title: validTitle,
  });

  // Step 5: Tell Next.js the page data is stale.
  revalidatePath('/');

  // Step 6: Report success.
  return { success: true };
}

// ─── TOGGLE TODO ───────────────────────────────────────────

export async function toggleTodo(id: number, completed: boolean): Promise<void> {
  // Step 1: Who is asking?
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in');
  }

  // Step 2: Update — but only if it belongs to this user.
  await db
    .update(todos)
    .set({ completed })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

  // Step 3: Refresh the page data.
  revalidatePath('/');
}

// ─── DELETE TODO ───────────────────────────────────────────

export async function deleteTodo(id: number): Promise<void> {
  // Step 1: Who is asking?
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in');
  }

  // Step 2: Delete — but only if it belongs to this user.
  await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

  // Step 3: Refresh the page data.
  revalidatePath('/');
}