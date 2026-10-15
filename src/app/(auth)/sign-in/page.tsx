// src/app/(auth)/sign-in/page.tsx
// The sign-in page. Has its own form that submits to the signIn action.

'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '@/app/actions/auth';

export default function SignInPage() {
  // Wire the form to the signIn server action.
  const [state, formAction, isPending] = useActionState(signIn, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome back</h1>

        <form action={formAction} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state.errors?.email && (
              <p className="text-sm text-red-600 mt-1">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state.errors?.password && (
              <p className="text-sm text-red-600 mt-1">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* General message */}
          {state.message && (
            <p className="text-sm text-red-600 text-center">{state.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}