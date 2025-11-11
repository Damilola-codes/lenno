import { NextResponse } from 'next/server'

export async function POST() {
  // This endpoint previously checked for an external network user id. Integration
  // has been removed — use /api/auth/register to create an account.
  return NextResponse.json({
    error: 'Deprecated endpoint: external user checks removed. Use /api/auth/register instead.'
  }, { status: 410 })
}