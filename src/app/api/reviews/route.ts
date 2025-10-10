// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/library/auth";
import { prisma } from "@/library/prisma";
import { z } from "zod";

const createReviewSchema = z.object({
  contractId: z.string(),
  receiverId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

// POST /api/reviews - Create a review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createReviewSchema.parse(body);

    // Verify contract exists and user is part of it
    const contract = await prisma.contract.findUnique({
      where: { id: validatedData.contractId },
      select: {
        clientId: true,
        freelancerId: true,
        status: true
      }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.clientId !== session.user.id && contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "You are not part of this contract" }, { status: 403 });
    }

    if (contract.status !== "COMPLETED") {
      return NextResponse.json({ error: "Can only review completed contracts" }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        contractId: validatedData.contractId,
        giverId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this contract" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        contractId: validatedData.contractId,
        giverId: session.user.id,
        receiverId: validatedData.receiverId,
        rating: validatedData.rating,
        comment: validatedData.comment
      },
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
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(review, { status: 201 });
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
// GET /api/reviews - Get reviews with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");
    const contractId = searchParams.get("contractId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: { receiverId?: string; contractId?: string } = {};
    
    if (receiverId) {
      where.receiverId = receiverId;
    }
    
    if (contractId) {
      where.contractId = contractId;
    }

    const reviews = await prisma.review.findMany({
      where,
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
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.review.count({ where });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}