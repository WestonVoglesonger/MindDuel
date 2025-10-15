import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes to be accessed without authentication
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow test matches without authentication
  if (pathname.startsWith('/game/test-')) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users from protected routes
  const protectedRoutes = ['/lobby', '/game', '/profile', '/leaderboard']
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for Supabase session cookies
    const hasAccessToken = request.cookies.has('sb-access-token') || 
                         request.cookies.has('sb-refresh-token') ||
                         request.cookies.has('supabase-auth-token')
    
    if (!hasAccessToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}