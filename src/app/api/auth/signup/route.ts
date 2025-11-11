import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  return NextResponse.json({
    error: 'Deprecated endpoint: signup removed. Use /api/auth/register instead.'
  }, { status: 410 })
}