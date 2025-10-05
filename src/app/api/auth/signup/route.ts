import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { piUserId, username, email, userType } = await req.json()

    // Validate required fields
    if (!piUserId || !username || !email || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate user type
    if (!['CLIENT', 'FREELANCER'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists (by Pi ID or email)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { piWalletId: piUserId },
          { email: email }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.piWalletId === piUserId) {
        return NextResponse.json(
          { error: 'Pi Network account already registered. Please sign in instead.' },
          { status: 409 }
        )
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered. Please use a different email or sign in.' },
          { status: 409 }
        )
      }
    }

    // Generate a secure password hash (though Pi Network users don't use traditional passwords)
    const hashedPassword = await bcrypt.hash(piUserId + Date.now().toString(), 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        piWalletId: piUserId,
        username: username,
        email: email,
        firstName: '', // Will be updated in profile later
        lastName: '',  // Will be updated in profile later
        password: hashedPassword,
        userType: userType,
        isVerified: true, // Pi Network users are auto-verified as pioneers
      }
    })

    // Create default profile
    await prisma.profile.create({
      data: {
        userId: user.id,
        title: userType === 'FREELANCER' 
          ? 'Pi Network Freelancer' 
          : 'Pi Network Client',
        description: userType === 'FREELANCER'
          ? 'Verified Pi Network pioneer ready to offer professional services'
          : 'Pi Network pioneer looking to hire talented freelancers'
      }
    })

    console.log(`New ${userType} account created for Pi user: ${username} (${piUserId})`)

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        piWalletId: user.piWalletId,
        isVerified: user.isVerified
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Pi Network signup error:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Account already exists with this information' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}