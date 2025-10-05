import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const { pathname } = request.nextUrl

  // Protected API routes
  if (pathname.startsWith('/api/jobs') && request.method === 'POST') {
    if (!token || token.userType !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Clients only' },
        { status: 401 }
      )
    }
  }

  if (pathname.startsWith('/api/proposals') && request.method === 'POST') {
    if (!token || token.userType !== 'FREELANCER') {
      return NextResponse.json(
        { error: 'Unauthorized - Freelancers only' },
        { status: 401 }
      )
    }
  }

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Client-only routes
  if (pathname.startsWith('/dashboard/client')) {
    if (!token || token.userType !== 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Freelancer-only routes
  if (pathname.startsWith('/dashboard/freelancer')) {
    if (!token || token.userType !== 'FREELANCER') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

// Rate limiting middleware
if (pathname.startsWith('/api/')) {
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
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return token
}

export function requireUserType(userType: 'CLIENT' | 'FREELANCER') {
  return async (request: NextRequest) => {
    const token = await authMiddleware(request)
    
    if (token instanceof NextResponse) {
      return token
    }

    if (token.userType !== userType) {
      return NextResponse.json(
        { error: `Access denied - ${userType}s only` },
         { status: 403 }
      )
    }

    return token
  }
}

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    try {
      const body = await request.json()
      return schema.parse(body)
    } catch (error) {
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