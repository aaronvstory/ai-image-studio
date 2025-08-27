import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Check both demo mode and auth required settings
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED !== 'false'
  
  if (isDemoMode || !authRequired) {
    // In demo mode or when auth not required, skip authentication
    return NextResponse.next()
  }
  
  // Update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}