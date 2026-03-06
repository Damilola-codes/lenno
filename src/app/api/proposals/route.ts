// 1. Proposals API
// /api/proposals/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/library/auth'
import { prisma } from '@/library/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
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
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')
    const mine = searchParams.get('mine')

    if (mine === '1' || mine === 'true') {
      const proposals = await prisma.proposal.findMany({
        where: { freelancerId: session.user.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              budget: true,
              isHourly: true,
              status: true,
              createdAt: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                  profile: {
                    select: {
                      location: true,
                    },
                  },
                },
              },
              skills: {
                select: {
                  id: true,
                  name: true,
                },
                take: 6,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ proposals })
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required unless mine=1 is provided' },
        { status: 400 },
      )
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
