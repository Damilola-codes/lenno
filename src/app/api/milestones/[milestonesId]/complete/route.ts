// app/api/milestones/[milestoneId]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/library/auth";
import { prisma } from "@/library/prisma";

// POST /api/milestones/[milestoneId]/complete - Mark milestone as completed
export async function POST(
  req: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const milestoneId = params.milestoneId;

    // Get milestone with contract info
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          select: {
            clientId: true,
            freelancerId: true,
            status: true
          }
        }
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Only freelancer can mark milestone as completed
    if (milestone.contract.freelancerId !== session.user.id) {
      return NextResponse.json({ error: "Only freelancer can complete milestones" }, { status: 403 });
    }

    if (milestone.isCompleted) {
      return NextResponse.json({ error: "Milestone already completed" }, { status: 400 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { isCompleted: true }
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

