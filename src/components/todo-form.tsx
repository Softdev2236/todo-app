// src/components/todo-form.tsx
// The "add a task" input at the top of the todo page.

'use client';

import { useActionState, useEffect, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { createTodo } from '@/app/actions/todos';
import type { TodoActionResult } from '@/app/actions/todos';

// ─── Validation ────────────────────────────────────────────

const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Please write something')
    .max(200, 'Keep it under 200 characters'),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Component ─────────────────────────────────────────────

export function TodoForm() {
  // Wire the form to the createTodo Server Action.
  const [actionState, formAction, isPending] = useActionState<
    TodoActionResult,
    FormData
  >(createTodo, {});

  // Access the TanStack Query client so we can invalidate the todos cache.
  const queryClient = useQueryClient();

  // Wrap manual formAction calls in a transition (needed for isPending).
  const [, startTransition] = useTransition();

  // React Hook Form handles input state and client-side validation.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '' },
  });

  // Keep a ref to the input so we can refocus after adding.
  const inputRef = useRef<HTMLInputElement>(null);

  // When the Server Action reports success:
  // 1. Clear the input
  // 2. Refocus the input
  // 3. Refetch the todos list from the server
  useEffect(() => {
    if (actionState.success) {
      reset();
      inputRef.current?.focus();
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  }, [actionState.success, reset, queryClient]);

  // Validate with React Hook Form first, then run the Server Action inside a transition.
  const onSubmit = handleSubmit((_data, event) => {
    if (!event?.target) return;

    const formData = new FormData(event.target as HTMLFormElement);

    startTransition(() => {
      formAction(formData);
    });
  });

  // Get the registration object once. We'll use its props explicitly.
  const titleField = register('title');

  // Show whichever error came first: client-side (RHF) or server-side.
  const errorMessage = errors.title?.message || actionState.errors?.title?.[0];

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative">
        <input
          name={titleField.name}
          onChange={titleField.onChange}
          onBlur={titleField.onBlur}
          ref={(element) => {
            titleField.ref(element);
            inputRef.current = element;
          }}
          type="text"
          placeholder="What needs to be done?"
          autoComplete="off"
          className="
            w-full
            px-5 py-4 pr-32
            text-base
            bg-white/60 backdrop-blur-xl
            border border-white/80
            rounded-2xl
            shadow-lg shadow-black/5
            placeholder:text-gray-400
            text-gray-800
            outline-none
            transition-all duration-200
            focus:bg-white/80
            focus:border-blue-300
            focus:shadow-xl focus:shadow-blue-500/10
            focus:ring-4 focus:ring-blue-500/10
          "
        />

        <button
          type="submit"
          disabled={isPending}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            px-5 py-2.5
            text-sm font-medium text-white
            bg-linear-to-br from-blue-500 to-indigo-600
            rounded-xl
            shadow-md shadow-blue-500/30
            transition-all duration-200
            hover:shadow-lg hover:shadow-blue-500/40
            hover:-translate-y-[calc(50%+1px)]
            active:translate-y-[-50%]
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:translate-y-[-50%]
            disabled:hover:shadow-md
          "
        >
          {isPending ? 'Adding...' : 'Add'}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-2 ml-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </form>
  );
}