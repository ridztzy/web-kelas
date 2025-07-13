import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get session from cookie
  const sessionCookie = req.cookies.get('supabase-session');
  const hasSession = sessionCookie && sessionCookie.value;

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (req.nextUrl.pathname === '/' && hasSession) {
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      // Check if session is still valid
      if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (e) {
      // Invalid session data, continue to login
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};