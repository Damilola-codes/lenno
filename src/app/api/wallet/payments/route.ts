import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/library/prisma'

const WalletPaymentSchema = z.object({
  amount: z.number().min(0.01),
  memo: z.string().min(1),
  type: z.enum(['job_payment', 'milestone_payment', 'bonus', 'tip', 'fee']),
  jobId: z.string().optional(),
  userId: z.string().min(1)
})

// POST /api/wallet/payments - Create wallet payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, memo, type, jobId, userId } = WalletPaymentSchema.parse(body)

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    
  // Calculate platform fee (5% for wallet transactions)
  const platformFeeRate = 0.05
  const platformFee = amount * platformFeeRate
  const networkFee = 0.01 // Network fee
  const totalAmount = amount + platformFee + networkFee

  // Create a payment record
    const payment = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: totalAmount,
      originalAmount: amount,
      platformFee,
      networkFee,
      memo,
      type,
      jobId,
      userId: userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        originalAmount: amount,
        platformFee,
        networkFee,
        feeBreakdown: {
          userAmount: amount,
          platformFee: platformFee,
          networkFee: networkFee,
          totalAmount: totalAmount
        }
      }
    }

    return NextResponse.json({
      payment,
      feeBreakdown: {
        userAmount: amount,
        platformFee: platformFee,
        networkFee: networkFee,
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