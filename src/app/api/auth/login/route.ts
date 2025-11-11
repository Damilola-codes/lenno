import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../library/prisma'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return NextResponse.json({ error: 'Database not configured. Please set DATABASE_URL in .env' }, { status: 503 })
    }
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Return safe user fields
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified
    }

    return NextResponse.json(safeUser)
  } catch (error: unknown) {
    console.error('Login error:', error)
    const msg = error instanceof Error ? error.message : String(error ?? '')
    if (msg.includes('Environment variable not found: DATABASE_URL') || msg.includes('PrismaClientInitializationError')) {
      return NextResponse.json({ error: 'Database not configured or unreachable. Ensure DATABASE_URL is set and the DB is running.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
