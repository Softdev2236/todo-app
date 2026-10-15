// src/components/user-header.tsx
// The top bar of the todo page: greeting + sign-out button.

import { signOut } from '@/app/actions/auth';

type Props = {
  email: string;
};

// Pick a greeting based on the current hour.
// This runs on the server when the page renders.
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function UserHeader({ email }: Props) {
  const greeting = getGreeting();

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          {greeting}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{email}</p>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="
            px-4 py-2
            text-sm font-medium text-gray-600
            bg-white/60 backdrop-blur-xl
            border border-white/80
            rounded-xl
            shadow-sm shadow-black/5
            transition-all duration-200
            hover:bg-white/90
            hover:text-gray-900
            hover:shadow-md
          "
        >
          Sign out
        </button>
      </form>
    </header>
  );
}