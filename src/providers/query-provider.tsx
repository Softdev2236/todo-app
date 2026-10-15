// src/providers/query-provider.tsx
// Sets up TanStack Query for the whole app.
// Every client component that uses useQuery must be inside this provider.

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create one QueryClient per browser session.
  // useState ensures we don't create a new client on every render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds.
            // During this window, navigating between pages won't refetch.
            staleTime: 30 * 1000,
            // Retry failed requests once before giving up.
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}