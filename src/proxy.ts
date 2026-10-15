// src/proxy.ts
// The "security guard" that runs before protected pages.
// If the user isn't logged in, send them to /sign-in.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages anyone can visit without logging in.
const PUBLIC_PATHS = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  // Step 1: Which page is the user trying to reach?
  const path = request.nextUrl.pathname;

  // Step 2: Is this a public page?
  const isPublicPage = PUBLIC_PATHS.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Step 3: Does the user have a session cookie?
  const sessionCookie = request.cookies.get('todo_session')?.value;
  const isLoggedIn = Boolean(sessionCookie);

  // Step 4: Not logged in and trying a private page → go to /sign-in
  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Step 5: Logged in and trying to visit /sign-in or /sign-up → go home
  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Step 6: Everything looks fine.
  return NextResponse.next();
}

// Only run the guard on real pages, not on static files.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};