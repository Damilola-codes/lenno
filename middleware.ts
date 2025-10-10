import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

// Simple session verification for Pi Network users
async function verifyPiSession(request: NextRequest) {
  try {
    // Check for session cookie or authorization header
    const sessionCookie = request.cookies.get('pi-session')?.value
    const authHeader = request.headers.get('authorization')
    
    if (!sessionCookie && !authHeader) {
      return null
    }
    
    // For client-side verification, we'll check if the session exists
    // In a real implementation, you might verify the Pi Network token here
    return {
      id: 'pi-user',
      userType: 'FREELANCER', // This would come from your session
      piWalletId: 'pi-wallet'
    }
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication for public auth routes and NextAuth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Skip authentication for public routes
  if (pathname === '/' || pathname.startsWith('/auth/') || pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  // Skip NextAuth specific routes to prevent conflicts
  if (pathname.includes('callback') || pathname.includes('csrf') || pathname.includes('nextauth')) {
    return NextResponse.next()
  }

  const userSession = await verifyPiSession(request)

  // Protected API routes
  if (pathname.startsWith('/api/jobs') && request.method === 'POST') {
    if (!userSession || userSession.userType !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Clients only' },
        { status: 401 }
      )
    }
  }

  if (pathname.startsWith('/api/proposals') && request.method === 'POST') {
    if (!userSession || userSession.userType !== 'FREELANCER') {
      return NextResponse.json(
        { error: 'Unauthorized - Freelancers only' },
        { status: 401 }
      )
    }
  }

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!userSession) {
      return NextResponse.redirect(new URL('/auth/signup', request.url))
    }
  }

  // Client-only routes
  if (pathname.startsWith('/dashboard/client')) {
    if (!userSession || userSession.userType !== 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Freelancer-only routes
  if (pathname.startsWith('/dashboard/freelancer')) {
    if (!userSession || userSession.userType !== 'FREELANCER') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Rate limiting middleware - exclude auth routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
    // For now, just add headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-IP', ip)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}

export async function authMiddleware(request: NextRequest) {
  const userSession = await verifyPiSession(request)

  if (!userSession) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return userSession
}

export function requireUserType(userType: 'CLIENT' | 'FREELANCER') {
  return async (request: NextRequest) => {
    const userSession = await authMiddleware(request)
    
    if (userSession instanceof NextResponse) {
      return userSession
    }

    if (userSession.userType !== userType) {
      return NextResponse.json(
        { error: `Access denied - ${userType}s only` },
         { status: 403 }
      )
    }

    return userSession
  }
}

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            issues: error.issues
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }
}