import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'

export async function POST(request: NextRequest) {
  try {
    const { piUserId } = await request.json()

    if (!piUserId) {
      return NextResponse.json(
        { error: 'Pi User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        piWalletId: piUserId
      },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
        isVerified: true,
        createdAt: true
      }
    })

    if (existingUser) {
      return NextResponse.json({
        exists: true,
        user: existingUser
      })
    } else {
      return NextResponse.json({
        exists: false
      })
    }

  } catch (error) {
    console.error('User check error:', error)
    return NextResponse.json(
      { error: 'Internal server error during user check' },
      { status: 500 }
    )
  }
}