// Redirect NextAuth routes to Pi Network authentication
import { NextRequest, NextResponse } from 'next/server'

// Since we're using Pi Network authentication, redirect all NextAuth calls
export async function GET(request: NextRequest) {
  console.log('NextAuth route accessed, redirecting to Pi Network auth')
  return NextResponse.redirect(new URL('/auth/signup', request.url))
}

export async function POST(request: NextRequest) {
  console.log('NextAuth POST route accessed, redirecting to Pi Network auth')
  return NextResponse.redirect(new URL('/auth/signup', request.url))
}