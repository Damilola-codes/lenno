import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/library/prisma"
import { getServerSession } from '@/library/auth'
import { Prisma } from "@prisma/client"
import { z } from "zod"

const JobQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  skills: z.string().optional()
})

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(req.url)
    
    console.time('jobs-query')
    console.log("🔄 Starting jobs query...")

    const query = JobQuerySchema.parse(Object.fromEntries(searchParams))
    
    const page = parseInt(query.page || '1')
    const limit = Math.min(parseInt(query.limit || '10'), 50)
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.JobWhereInput = { status: "OPEN" }
    
    // Add search filter
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } }
      ]
    }
    
    // Add budget filter
    if (query.minBudget || query.maxBudget) {
      where.budget = {}
      if (query.minBudget) {
        where.budget.gte = parseFloat(query.minBudget)
      }
      if (query.maxBudget) {
        where.budget.lte = parseFloat(query.maxBudget)
      }
    }
    
    // Add skills filter
    if (query.skills) {
      const skillNames = query.skills.split(',')
      where.skills = {
        some: { name: { in: skillNames } }
      }
    }

    // Execute queries in parallel
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          budget: true,
          status: true,
          createdAt: true,
          duration: true,
          isHourly: true,
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              profile: {
                select: {
                  avatar: true,
                  location: true
                }
              }
            }
          },
          skills: {
            select: {
              id: true,
              name: true
            },
            take: 10
          },
          _count: {
            select: { 
              proposals: true 
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ])

    const queryTime = Date.now() - startTime;
    console.log(`✅ Query completed in ${queryTime}ms`)
    
    if (queryTime > 1000) {
      console.warn(`⚠️ Slow query detected: ${queryTime}ms`)
    }

    const response = NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response

  } catch (error) {
    const errorTime = Date.now() - startTime
    console.error(`❌ Jobs API Error after ${errorTime}ms:`, error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    const body = await req.json()
    const { title, description, budget } = body || {}

    if (!title || !description || typeof budget !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const clientId = session?.user?.id ?? 'demo-client-id'

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        clientId
      }
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}