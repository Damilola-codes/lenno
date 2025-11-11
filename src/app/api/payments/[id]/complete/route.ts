import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/library/auth'
import { prisma } from '@/library/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  // Request body may include additional fields; we don't use external txid here
  await req.json()
  const transactionId = id

    // Verify transaction belongs to user and is in escrow
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ],
        status: 'ESCROW_HELD'
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found or not in escrow' }, { status: 404 })
    }

    // Complete the transaction
    const completedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED'
      },
      include: {
        client: {
          select: { id: true, username: true, userType: true }
        },
        freelancer: {
          select: { id: true, username: true, userType: true }
        }
      }
    })

    // Award reward points based on transaction amount
  // Reward points calculation (points per currency unit)
  const rewardPoints = Math.floor(transaction.amount * 5)

    // If this is linked to a job, update job status to completed
    if (transaction.jobId) {
      await prisma.job.update({
        where: { id: transaction.jobId },
        data: {
          status: 'COMPLETED'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      transaction: completedTransaction,
      rewardPoints 
    })
  } catch (error) {
    console.error('Payment completion error:', error)
    return NextResponse.json({ error: 'Failed to complete payment' }, { status: 500 })
  }
}