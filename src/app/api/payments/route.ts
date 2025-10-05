import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'
import { z } from 'zod'
import { TransactionStatus } from '@prisma/client'

const PLATFORM_FEE_RATE = 0.08; // 8%

const TransactionSchema = z.object({
  jobId: z.string(),
  amount: z.number().min(1),
  piTxHash: z.string().optional(),
  userId: z.string() // Add userId for authentication
})

// POST /api/payments - Create escrow transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobId, amount, piTxHash, userId } = TransactionSchema.parse(body)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user info to verify they exist and their type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify job exists and user is the client
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { 
        proposals: {
          where: { status: 'ACCEPTED' },
          include: { freelancer: true }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.clientId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Only job client can create payment' },
        { status: 403 }
      )
    }
    const acceptedProposal = job.proposals.find(p => p.status === 'ACCEPTED')
    
    if (!acceptedProposal) {
      return NextResponse.json(
        { error: 'No accepted proposal for this job' },
        { status: 400 }
      )
    }

    const platformFee = amount * PLATFORM_FEE_RATE
    const netAmount = amount - platformFee

    const transaction = await prisma.transaction.create({
      data: {
        jobId,
        clientId: userId,
        freelancerId: acceptedProposal.freelancerId,
        amount,
        platformFee,
        netAmount,
        piTxHash,
        status: 'ESCROW_HELD'
      }
    })

    return NextResponse.json({
      message: 'Payment held in escrow',
      transaction,
      breakdown: {
        total: amount,
        platformFee,
        freelancerReceives: netAmount,
        feePercentage: `${PLATFORM_FEE_RATE * 100}%`
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/payments - Get user's transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user info to verify they exist
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const where = {
      OR: [
        { clientId: userId },
        { freelancerId: userId }
      ],
      ...(status && { status: status.toUpperCase() as TransactionStatus })
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budget: true
          }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ transactions })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}