import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'

const PREDEFINED_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'UI/UX Design',
  'Digital Marketing', 'Content Writing', 'Data Science',
  // ... add all your skills here
]

// POST /api/skills/bulk - Bulk create skills
export async function POST(req: NextRequest) {
  try {
    const { skills } = await req.json()
    
    const skillsToCreate = skills || PREDEFINED_SKILLS

    const createdSkills = await Promise.all(
      skillsToCreate.map((skillName: string) => 
        prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName }
        })
      )
    )

    return NextResponse.json({ 
      message: `Created ${createdSkills.length} skills`,
      skills: createdSkills 
    })

  } catch (error) {
    console.error('Error creating skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}