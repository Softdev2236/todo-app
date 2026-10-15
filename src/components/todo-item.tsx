// src/components/todo-item.tsx
// A single todo row: checkbox, title, and delete button.
// Invalidates the todos cache after toggle and delete so the list stays in sync.

'use client';

import { useState, useTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toggleTodo, deleteTodo } from '@/app/actions/todos';

type Props = {
  id: number;
  title: string;
  completed: boolean;
};

export function TodoItem({ id, title, completed }: Props) {
  // useTransition lets us mark the Server Action calls as "pending"
  // so we can show a subtle loading state without blocking the UI.
  const [isPending, startTransition] = useTransition();

  // Local state for the checkbox so it feels instant.
  // We set this optimistically, then let the server confirm.
  const [isCompleted, setIsCompleted] = useState(completed);

  // Access the TanStack Query client so we can invalidate the todos cache.
  const queryClient = useQueryClient();

  function handleToggle() {
    const nextValue = !isCompleted;

    // Flip the checkbox immediately — no waiting for the server.
    setIsCompleted(nextValue);

    // Then tell the server, and refresh the list when done.
    startTransition(async () => {
      await toggleTodo(id, nextValue);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTodo(id);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    });
  }

  return (
    <li
      className={`
        group
        flex items-center gap-4
        px-4 py-3
        bg-white/70 backdrop-blur-xl
        border border-white/80
        rounded-xl
        shadow-sm shadow-black/5
        transition-all duration-200
        hover:bg-white/90
        hover:shadow-md hover:shadow-black/10
        ${isPending ? 'opacity-60' : 'opacity-100'}
      `}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isCompleted ? 'Mark as not done' : 'Mark as done'}
        className={`
          flex items-center justify-center
          w-6 h-6
          rounded-full
          border-2
          transition-all duration-200
          shrink-0
          ${
            isCompleted
              ? 'bg-linear-to-br from-blue-500 to-indigo-600 border-transparent'
              : 'border-gray-300 hover:border-blue-400'
          }
        `}
      >
        {isCompleted && (
          <svg
            viewBox="0 0 14 14"
            fill="none"
            className="w-3.5 h-3.5 text-white"
          >
            <path
              d="M2 7.5L5.5 11L12 3.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Title */}
      <span
        className={`
          flex-1
          text-gray-800
          transition-all duration-200
          ${isCompleted ? 'line-through text-gray-400' : ''}
        `}
      >
        {title}
      </span>

      {/* Delete button — hidden until hover or focus. */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete todo"
        className="
          flex items-center justify-center
          w-8 h-8
          rounded-lg
          text-gray-400
          opacity-0
          transition-all duration-200
          group-hover:opacity-100
          hover:bg-red-50 hover:text-red-500
          focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/30
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
    </li>
  );
}