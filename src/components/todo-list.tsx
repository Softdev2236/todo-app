// src/components/todo-list.tsx
// Renders all todos for the current user.
// Uses TanStack Query with initial data from the server,
// and Zustand for the current filter.

'use client';

import { useQuery } from '@tanstack/react-query';
import { useTodoStore } from '@/stores/todo-store';
import { TodoItem } from './todo-item';
import type { Todo } from '@/db/schema';

type Props = {
  initialTodos: Todo[];
};

// Fetch todos from the API route.
async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
}

export function TodoList({ initialTodos }: Props) {
  const filter = useTodoStore((state) => state.filter);

  const {
    data: todos,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    initialData: initialTodos,
    staleTime: 30 * 1000,
  });

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const remainingCount = todos.filter((todo) => !todo.completed).length;

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Something went wrong. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="w-full">
      {filteredTodos.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              title={todo.title}
              completed={todo.completed}
            />
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>
            {remainingCount === 0
              ? 'All done! 🎉'
              : remainingCount === 1
                ? '1 task remaining'
                : `${remainingCount} tasks remaining`}
          </span>

          {isFetching && (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              Syncing...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ filter }: { filter: string }) {
  if (filter === 'active') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No active tasks. Nice work!</p>
      </div>
    );
  }

  if (filter === 'completed') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Nothing completed yet.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-400">No tasks yet. Add one above to get started.</p>
    </div>
  );
}