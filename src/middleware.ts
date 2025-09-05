import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/certificates',
  '/payments',
  '/api/protest-query',
  '/api/certificates',
  '/api/payments',
]

// Admin paths that require ADMIN role
const adminPaths = [
  '/admin',
  '/api/admin',
]

// Paths that should redirect to dashboard if authenticated
const authPaths = [
  '/auth/login',
  '/auth/register',
]

// Admin auth path
const adminAuthPaths = [
  '/admin/login',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  try {
    // Check for simple-session cookie
    const sessionCookie = request.cookies.get('simple-session')
    let isAuthenticated = false
    let user = null
    
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie.value)
        // Check if session hasn't expired
        const expires = new Date(sessionData.expires)
        if (expires > new Date()) {
          isAuthenticated = true
          user = sessionData.user
        }
      } catch {
        // Invalid session cookie
        isAuthenticated = false
      }
    }
    
    // Check if the current path is protected
    const isProtectedPath = protectedPaths.some(path => 
      pathname.startsWith(path)
    )
    
    // Check if the current path is an admin path
    const isAdminPath = adminPaths.some(path => 
      pathname.startsWith(path)
    )
    
    // Check if the current path is an auth path
    const isAuthPath = authPaths.some(path => 
      pathname.startsWith(path)
    )
    
    // Check if the current path is an admin auth path
    const isAdminAuthPath = adminAuthPaths.some(path => 
      pathname.startsWith(path)
    )
    
    // Handle admin paths
    if (isAdminPath && !isAdminAuthPath) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      if (user?.role !== 'ADMIN') {
        // Redirect non-admin users to regular dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Handle admin login page
    if (isAdminAuthPath) {
      if (isAuthenticated && user?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (isAuthenticated && user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Redirect unauthenticated users away from protected paths
    if (isProtectedPath && !isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Redirect authenticated users away from auth pages
    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (all auth endpoints including custom ones)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - test files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|test).*)',
  ],
}