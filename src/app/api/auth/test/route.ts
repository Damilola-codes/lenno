import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🔍 Test GET endpoint hit')
  return NextResponse.json({ message: 'Test GET working', timestamp: new Date().toISOString() })
}

export async function POST(req: NextRequest) {
  console.log('🔍 Test POST endpoint hit')
  
  try {
    const body = await req.json()
    console.log('📥 Test POST body:', body)
    
    return NextResponse.json({ 
      message: 'Test POST working', 
      receivedData: body,
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    console.error('❌ Test POST JSON parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse JSON', details: String(error) },
      { status: 400 }
    )
  }
}