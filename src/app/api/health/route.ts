import { NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'

function databaseUrlIssue() {
  const value = process.env.DATABASE_URL
  if (!value || !value.trim()) return 'DATABASE_URL is missing.'

  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return 'DATABASE_URL contains wrapping quotes. Remove surrounding quotes in production environment variables.'
  }

  if (!trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgres://')) {
    return 'DATABASE_URL must start with postgresql:// or postgres://'
  }

  return null
}

export async function GET() {
  console.log('🔍 Database health check started')

  const dbUrlIssue = databaseUrlIssue()
  if (dbUrlIssue) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: dbUrlIssue,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
  
  try {
    // Test basic connection
    console.log('⏳ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test if User table exists and is accessible
    console.log('⏳ Testing User table...')
    const userCount = await prisma.user.count()
    console.log(`✅ User table accessible, current count: ${userCount}`)
    
    // Test if Profile table exists and is accessible
    console.log('⏳ Testing Profile table...')
    const profileCount = await prisma.profile.count()
    console.log(`✅ Profile table accessible, current count: ${profileCount}`)
    
    // Get database info
    console.log('⏳ Getting database info...')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Database info:', result)
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        users: userCount,
        profiles: profileCount
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack'
    })
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}