import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'

export async function POST(request: NextRequest) {
  // This endpoint previously checked for an external network user id. Integration
  // has been removed — use /api/auth/register to create an account.
  return NextResponse.json({
    error: 'Deprecated endpoint: external user checks removed. Use /api/auth/register instead.'
  }, { status: 410 })
}