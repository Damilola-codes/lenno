// 1. Proposals API
// /api/proposals/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/library/auth'
import { prisma } from '@/library/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.userType !== 'FREELANCER') {
      return NextResponse.json({ error: 'Only freelancers can submit proposals' }, { status: 403 })
    }

    const { jobId, coverLetter, proposedRate, duration } = await req.json()

    const proposal = await prisma.proposal.create({
      data: {
        jobId,
        freelancerId: session.user.id,
        coverLetter,
        proposedRate,
        duration
      }
    })

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
    try {

    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')
    if (!jobId) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }
    const proposals = await prisma.proposal.findMany({
        where: { jobId },
        include: {
            freelancer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    email: true,
                    userType: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ proposals })
} catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
}
