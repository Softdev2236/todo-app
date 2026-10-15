// src/app/layout.tsx
// The outer shell. Wraps every page with the QueryProvider.

import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

export const metadata = {
  title: 'Todo App',
  description: 'A modern todo app built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}