import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Deprecated debug endpoint: signup flow removed.
  return NextResponse.json({
    error: 'Deprecated endpoint: debug signup removed. Use /api/auth/register.'
  }, { status: 410 })
}