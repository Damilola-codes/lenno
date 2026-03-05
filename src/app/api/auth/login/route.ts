import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../../library/prisma'

function databaseUrlIssue() {
  const value = process.env.DATABASE_URL
  if (!value) return 'Database not configured. Set DATABASE_URL.'

  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return 'DATABASE_URL appears to include wrapping quotes. Remove surrounding quotes in production env vars.'
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const dbIssue = databaseUrlIssue()
    if (dbIssue) {
      console.error('Login route DB config issue:', dbIssue)
      return NextResponse.json({ error: dbIssue }, { status: 503 })
    }
    const body = await req.json()
    const { email, identifier, countryCode, password } = body || {}
    const loginIdentifier = (identifier || email || '').toString().trim()

    if (!loginIdentifier || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const normalizedCountryCode = (countryCode || '+62').toString().replace('+', '')
    const normalizedDigits = loginIdentifier.replace(/\D/g, '')
    const isEmail = loginIdentifier.includes('@')
    const usernameCandidates = isEmail || !normalizedDigits
      ? []
      : [
          `ph_${normalizedCountryCode}${normalizedDigits}`,
          `ph_${normalizedDigits}`
        ]

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          ...(usernameCandidates.length ? usernameCandidates.map((candidate) => ({ username: candidate })) : [])
        ]
      }
    })
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

    const sessionPayload = {
      user: safeUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    const response = NextResponse.json(safeUser)
    response.cookies.set('auth-session', encodeURIComponent(JSON.stringify(sessionPayload)), {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      httpOnly: false,
    })

    return response
  } catch (error: unknown) {
    console.error('Login error:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          { error: 'Database schema is not up to date. Run prisma migrate deploy.' },
          { status: 503 },
        )
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database not configured or unreachable in production environment.' },
        { status: 503 },
      )
    }

    const msg = error instanceof Error ? error.message : String(error ?? '')
    if (msg.includes('Environment variable not found: DATABASE_URL') || msg.includes('PrismaClientInitializationError')) {
      return NextResponse.json({ error: 'Database not configured or unreachable. Ensure DATABASE_URL is set and the DB is running.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
