// src/app/page.tsx
// The home page. Fetches todos on the server and passes them to the client.

import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { UserHeader } from '@/components/user-header';
import { TodoForm } from '@/components/todo-form';
import { FilterTabs } from '@/components/filter-tabs';
import { TodoList } from '@/components/todo-list';

export default async function HomePage() {
  // Step 1: Who is this?
  const user = await getCurrentUser();

  // Step 2: Not logged in? Send to sign-in.
  if (!user) {
    redirect('/sign-in');
  }

  // Step 3: Fetch this user's todos from the database, newest first.
  const initialTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, user.id))
    .orderBy(desc(todos.createdAt));

  // Step 4: Render the page.
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* Decorative blurred blobs in the background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      {/* The content sits above the blobs */}
      <div className="relative max-w-2xl mx-auto pt-12 pb-16">
        <UserHeader email={user.email} />

        <div className="space-y-4">
          <TodoForm />
          <FilterTabs />
        </div>

        <div className="mt-6">
          <TodoList initialTodos={initialTodos} />
        </div>
      </div>
    </main>
  );
}