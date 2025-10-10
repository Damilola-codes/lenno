import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/library/auth'
import { prisma } from '@/library/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { piPaymentId } = await req.json()
    const transactionId = params.id

    // Verify transaction belongs to user (either as client or freelancer)
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction with Pi payment hash and approve status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        piTxHash: piPaymentId,
        status: 'ESCROW_HELD'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment approval error:', error)
    return NextResponse.json({ error: 'Failed to approve payment' }, { status: 500 })
  }
}