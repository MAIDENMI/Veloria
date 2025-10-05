import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    const onboarded = req.nextauth?.token?.onboarded;
    // Redirect new users to /onboarding (except if already there or on profile)
    if (onboarded === false && !req.nextUrl.pathname.startsWith('/onboarding') && !req.nextUrl.pathname.startsWith('/profile')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    return res;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if user is authenticated
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Protect these routes - users must be signed in
export const config = {
  matcher: [
    '/',
    '/call/:path*',
    '/session/:path*',
    '/history/:path*',
    '/onboarding',
    '/profile',
    // Add any other protected routes here
    // Note: These patterns use Next.js middleware matchers
    // '/api/protected/:path*', // Example: protect API routes
  ]
}
