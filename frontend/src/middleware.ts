import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: JWT tokens are stored in localStorage (not cookies), so middleware
// cannot perform server-side auth checks. Authentication is enforced by the
// client-side ProtectedRoute component. This middleware is kept minimal.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
