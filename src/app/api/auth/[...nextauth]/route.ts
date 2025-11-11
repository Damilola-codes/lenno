// Redirect NextAuth routes to the app's signup page. External integration removed.
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('NextAuth route accessed — redirecting to signup')
  return NextResponse.redirect(new URL('/auth/signup', request.url))
}

export async function POST(request: NextRequest) {
  console.log('NextAuth POST route accessed — redirecting to signup')
  return NextResponse.redirect(new URL('/auth/signup', request.url))
}