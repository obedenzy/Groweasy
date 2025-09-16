import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/', '/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Allow public access to the review pages.
  if (pathname.startsWith('/reviews/')) {
    return NextResponse.next();
  }

  // Redirect logged-in users from public pages to their dashboard.
  if (token && publicPaths.includes(pathname)) {
    if (token.role === 'AGENCY_ADMIN' && token.agencyId) {
      return NextResponse.redirect(new URL(`/agency/${token.agencyId}/dashboard`, request.url));
    }
    if (token.role === 'SUBACCOUNT_USER' && token.subaccountId) {
      return NextResponse.redirect(new URL(`/subaccount/${token.subaccountId}/dashboard`, request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Define protected routes.
  const protectedPaths = ['/agency', '/subaccount', '/dashboard'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  // If a user is not logged in and is trying to access a protected route, redirect to login.
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for static assets, images, and API routes.
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
