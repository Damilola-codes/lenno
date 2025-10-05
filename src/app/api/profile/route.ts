// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/library/auth";
import { prisma } from "@/library/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  avatar: z.string().url().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  skills: z.array(z.string()).optional()
});

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            skills: true
          }
        },
        reviewsReceived: {
          include: {
            giver: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                profile: {
                  select: {
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: {
            postedJobs: true,
            proposals: true,
            contracts: session.user.userType === "FREELANCER" ? true : false,
            hiredContracts: session.user.userType === "CLIENT" ? true : false
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate average rating
    const averageRating = user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / user.reviewsReceived.length
      : null;

    return NextResponse.json({
      ...user,
      averageRating,
      totalReviews: user.reviewsReceived.length
    });
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const updateData: {
      title?: string;
      description?: string;
      hourlyRate?: number;
      avatar?: string;
      location?: string;
      website?: string;
      skills?: {
        set: never[];
        connectOrCreate: { where: { name: string }; create: { name: string } }[];
      };
    } = {
      title: validatedData.title,
      description: validatedData.description,
      hourlyRate: validatedData.hourlyRate,
      avatar: validatedData.avatar,
      location: validatedData.location,
      website: validatedData.website
    };

    // Handle skills update
    if (validatedData.skills) {
      updateData.skills = {
        set: [], // Clear existing skills
        connectOrCreate: validatedData.skills.map(skill => ({
          where: { name: skill },
          create: { name: skill }
        }))
      };
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData,
      include: {
        skills: true
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}