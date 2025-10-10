import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('🧪 Debug signup endpoint hit')
  
  try {
    console.log('📋 Request info:', {
      method: req.method,
      url: req.url,
      contentType: req.headers.get('content-type'),
      userAgent: req.headers.get('user-agent')
    })
    
    console.log('⏳ Attempting to parse body...')
    const body = await req.json()
    console.log('✅ Body parsed successfully:', JSON.stringify(body, null, 2))
    
    // Check required fields
    const { piUserId, username, email, userType } = body
    
    console.log('🔍 Field validation:', {
      piUserId: piUserId ? '✅ present' : '❌ missing',
      username: username ? '✅ present' : '❌ missing',
      email: email ? '✅ present' : '❌ missing',
      userType: userType ? `✅ present (${userType})` : '❌ missing'
    })
    
    const missing = []
    if (!piUserId) missing.push('piUserId')
    if (!username) missing.push('username') 
    if (!email) missing.push('email')
    if (!userType) missing.push('userType')
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing fields: ${missing.join(', ')}`,
        receivedFields: Object.keys(body),
        receivedData: body
      }, { status: 400 })
    }
    
    // Validate userType
    if (!['CLIENT', 'FREELANCER'].includes(userType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid userType: ${userType}. Must be CLIENT or FREELANCER`,
        receivedData: body
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug validation passed',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug signup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Request processing failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}