import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/library/auth'
import { z } from 'zod'

const WalletPaymentSchema = z.object({
  amount: z.number().min(0.01),
  memo: z.string().min(1),
  type: z.enum(['job_payment', 'milestone_payment', 'bonus', 'tip', 'fee']),
  jobId: z.string().optional()
})

// POST /api/wallet/payments - Create wallet payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, memo, type, jobId } = WalletPaymentSchema.parse(body)
    
    // Calculate platform fee (5% for wallet transactions)
    const platformFeeRate = 0.05
    const platformFee = amount * platformFeeRate
    const piNetworkFee = 0.01 // Pi Network's standard fee
    const totalAmount = amount + platformFee + piNetworkFee

    // Create a payment record for Pi Network integration
    const payment = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: totalAmount,
      originalAmount: amount,
      platformFee,
      piNetworkFee,
      memo,
      type,
      jobId,
      userId: session.user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        originalAmount: amount,
        platformFee,
        piNetworkFee,
        feeBreakdown: {
          userAmount: amount,
          platformFee: platformFee,
          piNetworkFee: piNetworkFee,
          totalAmount: totalAmount
        }
      }
    }

    return NextResponse.json({ 
      payment,
      feeBreakdown: {
        userAmount: amount,
        platformFee: platformFee,
        piNetworkFee: piNetworkFee,
        totalAmount: totalAmount
      }
    })
  } catch (error) {
    console.error('Wallet payment creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}