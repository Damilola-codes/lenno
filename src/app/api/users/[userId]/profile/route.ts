import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'
import { z } from 'zod'

// Validation schema for profile updates
const ProfileUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  hourlyRate: z.number().min(0).max(1000).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string()).optional()
})

// GET /api/users/[userId]/profile - Get user profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        userType: true,
        createdAt: true,
        profile: {
          include: {
            skills: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[userId]/profile - Update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = ProfileUpdateSchema.parse(body)

    // Handle skills separately if provided
    const { skills, ...profileData } = validatedData

    // Start building the update query
    const updateData: {
      profile: {
        upsert: {
          create: typeof profileData & {
            skills?: {
              connect: { id: string }[]
            }
          }
          update: typeof profileData & {
            skills?: {
              set: { id: string }[]
            }
          }
        }
      }
    } = {
      profile: {
        upsert: {
          create: profileData,
          update: profileData
        }
      }
    }

    // If skills are provided, handle skill connections
    if (skills && skills.length > 0) {
      // First, ensure all skills exist in the database
      const existingSkills = await prisma.skill.findMany({
        where: { name: { in: skills } }
      })

      const existingSkillNames = existingSkills.map(skill => skill.name)
      const newSkills = skills.filter(skill => !existingSkillNames.includes(skill))

      // Create new skills if they don't exist
      if (newSkills.length > 0) {
        await prisma.skill.createMany({
          data: newSkills.map(name => ({ name })),
          skipDuplicates: true
        })
      }

      // Get all skills that should be connected
      const allSkills = await prisma.skill.findMany({
        where: { name: { in: skills } }
      })

      // Update profile with skills connection
      updateData.profile.upsert.create.skills = {
        connect: allSkills.map(skill => ({ id: skill.id }))
      }
      updateData.profile.upsert.update.skills = {
        set: allSkills.map(skill => ({ id: skill.id }))
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        userType: true,
        profile: {
          include: {
            skills: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          issues: error.issues
        },
        { status: 400 }
      )
    }

    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[userId]/profile - Delete user profile (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Soft delete by clearing profile data
    await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: {
            title: null,
            description: null,
            hourlyRate: null,
            location: null,
            website: null,
            avatar: null,
            skills: {
              set: []
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Profile deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}