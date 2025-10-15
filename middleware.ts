import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes to be accessed without authentication
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Update the Supabase session
  const response = await updateSession(request)

  // Redirect unauthenticated users from protected routes
  const protectedRoutes = ['/lobby', '/game', '/profile', '/leaderboard']
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check if user is authenticated by looking at the session cookie
    const sessionCookie = request.cookies.get('sb-access-token')
    
    if (!sessionCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return response
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