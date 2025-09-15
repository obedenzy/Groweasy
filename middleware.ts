import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If a user is logged in, they should not be on the homepage or auth pages.
  // Redirect them to their appropriate dashboard.
  if (token && (pathname === '/' || pathname.startsWith('/auth'))) {
    if (token.role === 'AGENCY_ADMIN' && token.agencyId) {
      return NextResponse.redirect(new URL(`/agency/${token.agencyId}/dashboard`, request.url));
    }
    if (token.role === 'SUBACCOUNT_USER' && token.subaccountId) {
      return NextResponse.redirect(new URL(`/subaccount/${token.subaccountId}/dashboard`, request.url));
    }
    // Fallback if role/ID is missing, though this shouldn't happen in a valid state.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If a user is not logged in, they can only access public pages.
  // If they try to access a protected page, redirect them to the login page.
  const isProtectedRoute = pathname.startsWith('/agency') || pathname.startsWith('/subaccount') || pathname.startsWith('/dashboard');

  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * This matcher ensures the middleware runs on all the paths we need to check,
   * including the homepage, authentication pages, and all protected routes.
   * It is more explicit and reliable than the previous regex-based matcher.
   */
  matcher: [
    '/', // The marketing homepage
    '/auth/:path*', // All authentication pages
    '/dashboard/:path*', // Generic dashboard and its sub-paths
    '/agency/:path*', // All agency-specific routes
    '/subaccount/:path*', // All subaccount-specific routes
  ],
};
