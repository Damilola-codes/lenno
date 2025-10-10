import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  console.log('🚀 Signup API endpoint hit')
  console.log('📋 Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })
  
  let body
  try {
    console.log('⏳ Attempting to parse request body...')
    body = await req.json()
    console.log('✅ Request body parsed successfully')
    console.log('📥 Request body:', JSON.stringify(body, null, 2))
  } catch (parseError) {
    console.error('❌ Failed to parse request body:', parseError)
    console.error('❌ Parse error details:', {
      name: parseError instanceof Error ? parseError.name : 'Unknown',
      message: parseError instanceof Error ? parseError.message : String(parseError),
      stack: parseError instanceof Error ? parseError.stack : 'No stack'
    })
    return NextResponse.json(
      { error: 'Invalid JSON in request body', details: 'Please check your request format' },
      { status: 400 }
    )
  }

  try {
    console.log('⏳ Extracting fields from body...')
    const { piUserId, username, email, userType, piAccessToken, isExistingUser, currentRole } = body
    
    console.log('🔍 Extracted fields:', {
      piUserId: piUserId ? 'present' : 'missing',
      username: username ? `present (${username})` : 'missing', 
      email: email ? `present (${email})` : 'missing',
      userType: userType ? userType : 'missing',
      currentRole: currentRole ? currentRole : 'missing',
      isExistingUser: isExistingUser ? 'true' : 'false',
      piAccessToken: piAccessToken ? 'present (ignored)' : 'missing (ignored)'
    })

    // Handle existing user (role switching)
    if (isExistingUser) {
      console.log('🔄 Processing existing user role switch...')
      
      if (!piUserId || !currentRole) {
        return NextResponse.json(
          { error: 'Missing required fields for role switch', details: 'Pi User ID and role are required' },
          { status: 400 }
        )
      }

      if (!['CLIENT', 'FREELANCER'].includes(currentRole)) {
        return NextResponse.json(
          { error: 'Invalid role', details: 'Role must be either CLIENT or FREELANCER' },
          { status: 400 }
        )
      }

      // Find user by Pi Network ID
      const user = await prisma.user.findFirst({
        where: { piWalletId: piUserId },
        include: { profile: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Account not found', details: 'Please sign up first as a Pi Network pioneer.' },
          { status: 404 }
        )
      }

      // Update user's current role if different
      let updatedUser = user
      if (user.userType !== currentRole) {
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { 
            userType: currentRole,
            updatedAt: new Date()
          },
          include: { profile: true }
        })
        console.log(`✅ User ${user.username} switched role from ${user.userType} to ${currentRole}`)
      }

      console.log(`✅ Existing user authenticated: ${updatedUser.username} (${updatedUser.userType})`)

      return NextResponse.json({
        message: 'Authentication successful',
        roleChanged: user.userType !== currentRole,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          userType: updatedUser.userType,
          piWalletId: updatedUser.piWalletId,
          isVerified: updatedUser.isVerified,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profile: updatedUser.profile
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
    }

    // Handle new user signup (existing logic)
    console.log('👤 Processing new user signup...')

    // Validate required fields with specific messages
    const missingFields = []
    if (!piUserId) missingFields.push('piUserId')
    if (!username) missingFields.push('username')
    if (!email) missingFields.push('email')
    if (!userType) missingFields.push('userType')
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`
      console.error('❌ Signup validation error:', errorMsg)
      return NextResponse.json(
        { error: errorMsg, details: 'Please provide all required information to create your account' },
        { status: 400 }
      )
    }

    // Validate user type
    if (!['CLIENT', 'FREELANCER'].includes(userType)) {
      const errorMsg = `Invalid user type: ${userType}. Must be either CLIENT or FREELANCER`
      console.error('❌ Signup validation error:', errorMsg)
      return NextResponse.json(
        { error: errorMsg, details: 'Please select a valid account type' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const errorMsg = `Invalid email format: ${email}`
      console.error('❌ Signup validation error:', errorMsg)
      return NextResponse.json(
        { error: 'Invalid email format', details: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed, checking for existing user...')

    // Check if user already exists (by Pi ID or email)
    console.log('🔍 Checking for existing user with email:', email, 'and piUserId:', piUserId)
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
        const errorMsg = `Pi Network account already registered: ${piUserId}`
        console.error('❌ Signup error:', errorMsg)
        return NextResponse.json(
          { error: 'Pi Network account already registered. Please sign in instead.' },
          { status: 409 }
        )
      }
      if (existingUser.email === email) {
        const errorMsg = `Email already registered: ${email}`
        console.error('❌ Signup error:', errorMsg)
        return NextResponse.json(
          { error: 'Email already registered. Please use a different email or sign in.' },
          { status: 409 }
        )
      }
    }

    // Generate a secure password hash (though Pi Network users don't use traditional passwords)
    console.log('🔑 Generating password hash...')
    const hashedPassword = await bcrypt.hash(piUserId + Date.now().toString(), 12)

    // Create new user
    console.log('👤 Creating new user in database...')
    const user = await prisma.user.create({
      data: {
        piWalletId: piUserId,
        username: username,
        email: email,
        firstName: username, // Use username as placeholder until profile is completed
        lastName: 'Pioneer',  // Default last name for Pi Network users
        password: hashedPassword,
        userType: userType,
        isVerified: true, // Pi Network users are auto-verified as pioneers
      }
    })

    // Create default profile
    console.log('📋 Creating default profile...')
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

    console.log(`✅ New ${userType} account created successfully for Pi user: ${username} (${piUserId})`)

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
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('❌ Pi Network signup error:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Account already exists with this information', details: 'A user with this email or Pi ID already exists' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Database relationship error', details: 'Please contact support if this persists' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('Table') && error.message.includes('doesn\'t exist')) {
        return NextResponse.json(
          { error: 'Database not initialized', details: 'Database tables missing. Please contact support' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.', details: 'Internal server error occurred' },
      { status: 500 }
    )
  }
}