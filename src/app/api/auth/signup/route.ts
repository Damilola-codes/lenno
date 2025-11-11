import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    error: 'Deprecated endpoint: signup removed. Use /api/auth/register instead.'
  }, { status: 410 })
}